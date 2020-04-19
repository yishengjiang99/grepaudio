/**
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @class NoiseGate
 * @extends AudioWorkletProcessor
 * @description A noise gate allows audio signals to pass only when the
 * registered volume is above a specified threshold.
 */
registerProcessor('noise_gater',
                  class NoiseGateAudioWorklet extends AudioWorkletProcessor{

  static get parameterDescriptors() {
    return [
      // An upper bound of 100ms for attack and release is sufficiently high
      // to enable smooth transitions between sound and silence.
      // The default value of 50ms has been set experimentally to minimize
      // glitches in the demo.
      {name: 'attack', defaultValue: 0.05, minValue: 0, maxValue: 0.1},
      {name: 'release', defaultValue: 0.05, minValue: 0, maxValue: 0.1},
      // The maximum threshold is 0 dBFS, and the minimum is -100 dBFS since
      // the sound is inaudible at that level. The default is set to -40
      // as an appropriate setting for the demo.
      {name: 'threshold', defaultValue: -80, minValue: -100, maxValue: 0},
      // The default timeConstant has been set experimentally to 0.0025s to
      // balance delay for high frequency suppression. The maximum value is set
      // somewhat arbitrarily at 0.1 since the envelope is very delayed at
      // values beyond this.
      {name: 'timeConstant', defaultValue: 0.0025, minValue: 0, maxValue: 0.1}
    ];
  }

  constructor() {
    super();

    // The previous envelope level, a float representing signal amplitude.
    this.previousLevel_ = 0;

    // The last weight (between 0 and 1) assigned, where 1 means the gate
    // is open and 0 means it is closed and the sample in the output buffer is
    // muted. When attacking, the weight will linearly decrease from 1 to 0, and
    // when releasing the weight linearly increase from 0 to 1.
    this.previousWeight_ = 1.0;
    this.envelope_ = new Float32Array(128);
    this.weights_ = new Float32Array(128);

    // TODO (issue #111): Use getContextInfo() to get sample rate.
    this.sampleRate = 44100;
  }

  /**
   * Control the dynamic range of input based on specified threshold.
   * @param {AudioBuffer} input Input audio data
   * @param {AudioBuffer} output Output audio data
   * @param {Object} parameters K-rate audio params.
   * @param {Number} parameters.attack Seconds for gate to fully close.
   * @param {Number} parameters.release Seconds for gate to fully open.
   * @param {Number} parameters.timeConstant Seconds for envelope follower's
   *                                         smoothing filter delay.
   * @param {Number} parameters.threshold Decibel level beneath which sound is
   *                                      muted.
   */
  process(input, output, parameters) {
    // Alpha controls a tradeoff between the smoothness of the
    // envelope and its delay, with a higher value giving more smoothness at
    // the expense of delay and vice versa.
    this.alpha_ = this.getAlphaFromTimeConstant_(
        parameters.timeConstant[0], this.sampleRate);

    // K-rate: use the first element of parameter data to process each render
    // quantum.
    this.attack = parameters.attack[0];
    this.release = parameters.release[0];
    this.threshold = parameters.threshold[0];

    let inputChannelData = input[0];
    let outputChannelData = output[0];

    let envelope = this.detectLevel_(inputChannelData);
    let weights = this.computeWeights_(envelope);

    for (let j = 0; j < inputChannelData.length; j++) {
      outputChannelData[j] = weights[j] * inputChannelData[j];
    }
  }

  /**
   * Compute an envelope follower for the signal.
   * @param {Float32Array} channelData Input channel data.
   * @return {Float32Array} The level of the signal.
   */
  detectLevel_(channelData) {
    // The signal level is determined by filtering the square of the signal
    // with exponential smoothing. See
    // http://www.aes.org/e-lib/browse.cfm?elib=16354 for details.
    this.envelope_[0] = this.alpha_ * this.previousLevel_ +
        (1 - this.alpha_) * Math.pow(channelData[0], 2);

    for (let j = 1; j < channelData.length; j++) {
      this.envelope_[j] = this.alpha_ * this.envelope_[j - 1] +
          (1 - this.alpha_) * Math.pow(channelData[j], 2);
    }
    this.previousLevel_ = this.envelope_[this.envelope_.length - 1];

    return this.envelope_;
  }

  /**
   * Computes an array of weights which determines what samples are silenced.
   * @param {Float32Array} envelope The output from envelope follower.
   * @return {Float32Array} weights Numbers in the range 0 to 1 set in
   *                                accordance with the threshold, the envelope,
   *                                and attack and release.
   */
  computeWeights_(envelope) {
    // When attack or release are 0, the weight changes between 0 and 1
    // in one step.
    let attackSteps = 1;
    let releaseSteps = 1;
    let attackLossPerStep = 1;
    let releaseGainPerStep = 1;

    // When attack or release are > 0, the associated weight changes between 0
    // and 1 in the number of steps corresponding to the millisecond attack
    // or release time parameters.
    if (this.attack > 0) {
      attackSteps = Math.ceil(this.sampleRate * this.attack);
      attackLossPerStep = 1 / attackSteps;
    }
    if (this.release > 0) {
      releaseSteps = Math.ceil(this.sampleRate * this.release);
      releaseGainPerStep = 1 / releaseSteps;
    }
    // TODO: Replace this weights-based approach for enabling attack/release
    // parameters with the method described on page 22 in
    // "Signal Processing Techniques for Digital Audio Effects".
    
    let scaledEnvelopeValue;
    let weight;

    // The array of weights will be between 0 and 1 depending on if the
    // noise gate is open, attacking, releasing, or closed.
    for (let i = 0; i < envelope.length; i++) {
      // For sine waves, the envelope eventually reaches an average power of
      // a^2 / 2. Sine waves are therefore scaled back to the original
      // amplitude, but other waveforms or constant sources can only be
      // approximated.
      scaledEnvelopeValue = NoiseGateAudioWorklet.toDecibel(2 * envelope[i]);

      if (scaledEnvelopeValue < this.threshold) {
        weight = this.previousWeight_ - attackLossPerStep;
        this.weights_[i] = Math.max(weight, 0);
      } else {
        weight = this.previousWeight_ + releaseGainPerStep;
        this.weights_[i] = Math.min(weight, 1);
      }
      this.previousWeight_ = this.weights_[i];
    }
    return this.weights_;
  }

  /**
   * Computes the filter coefficent for the envelope filter.
   * @param  {Number} timeConstant The time in seconds for filter to reach
   *                               1 - 1/e of its value given a transition from
   *                               0 to 1.
   * @param  {Number} sampleRate The number of samples per second.
   * @return {Number} Coefficient governing envelope response.
   */
  getAlphaFromTimeConstant_(timeConstant, sampleRate) {
    return Math.exp(-1 / (sampleRate * timeConstant));
  }

  /**
   * Converts number into decibel measure.
   * @param  {Number} powerLevel The power level of the signal.
   * @return {Number} The dBFS of the power level.
   */
  static toDecibel(powerLevel) {
    return 10 * Math.log10(powerLevel);
  }
});
/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

// Basic byte unit of WASM heap. (16 bit = 2 bytes)
const BYTES_PER_UNIT = Uint16Array.BYTES_PER_ELEMENT;

// Byte per audio sample. (32 bit float)
const BYTES_PER_SAMPLE = Float32Array.BYTES_PER_ELEMENT;

// The max audio channel on Chrome is 32.
const MAX_CHANNEL_COUNT = 32;

// WebAudio's render quantum size.
const RENDER_QUANTUM_FRAMES = 128;


/**
 * A WASM HEAP wrapper for AudioBuffer class. This breaks down the AudioBuffer
 * into an Array of Float32Array for the convinient WASM opearion.
 *
 * @class
 * @dependency Module A WASM module generated by the emscripten glue code.
 */
class HeapAudioBuffer {
  /**
   * @constructor
   * @param  {object} wasmModule WASM module generated by Emscripten.
   * @param  {number} length Buffer frame length.
   * @param  {number} channelCount Number of channels.
   * @param  {number=} maxChannelCount Maximum number of channels.
   */
  constructor(wasmModule, length, channelCount, maxChannelCount) {
    // The |channelCount| must be greater than 0, and less than or equal to
    // the maximum channel count.
    this._isInitialized = false;
    this._module = wasmModule;
    this._length = length;
    this._maxChannelCount = maxChannelCount
        ? Math.min(maxChannelCount, MAX_CHANNEL_COUNT)
        : channelCount;
    this._channelCount = channelCount;
    this._allocateHeap();
    this._isInitialized = true;
  }

  /**
   * Allocates memory in the WASM heap and set up Float32Array views for the
   * channel data.
   *
   * @private
   */
  _allocateHeap() {
    const channelByteSize = this._length * BYTES_PER_SAMPLE;
    const dataByteSize = this._channelCount * channelByteSize;
    this._dataPtr = this._module._malloc(dataByteSize);
    this._channelData = [];
    for (let i = 0; i < this._channelCount; ++i) {
      let startByteOffset = this._dataPtr + i * channelByteSize;
      let endByteOffset = startByteOffset + channelByteSize;
      // Get the actual array index by dividing the byte offset by 2 bytes.
      this._channelData[i] =
          this._module.HEAPF32.subarray(startByteOffset >> BYTES_PER_UNIT,
                                        endByteOffset >> BYTES_PER_UNIT);
    }
  }

  /**
   * Adapt the current channel count to the new input buffer.
   *
   * @param  {number} newChannelCount The new channel count.
   */
  adaptChannel(newChannelCount) {
    if (newChannelCount < this._maxChannelCount) {
      this._channelCount = newChannelCount;
    }
  }

  /**
   * Getter for the buffer length in frames.
   *
   * @return {?number} Buffer length in frames.
   */
  get length() {
    return this._isInitialized ? this._length : null;
  }

  /**
   * Getter for the number of channels.
   *
   * @return {?number} Buffer length in frames.
   */
  get numberOfChannels() {
    return this._isInitialized ? this._channelCount : null;
  }

  /**
   * Getter for the maxixmum number of channels allowed for the instance.
   *
   * @return {?number} Buffer length in frames.
   */
  get maxChannelCount() {
    return this._isInitialized ? this._maxChannelCount : null;
  }

  /**
   * Returns a Float32Array object for a given channel index. If the channel
   * index is undefined, it returns the reference to the entire array of channel
   * data.
   *
   * @param  {number|undefined} channelIndex Channel index.
   * @return {?Array} a channel data array or an
   * array of channel data.
   */
  getChannelData(channelIndex) {
    if (channelIndex >= this._channelCount) {
      return null;
    }

    return typeof channelIndex === 'undefined'
        ? this._channelData : this._channelData[channelIndex];
  }

  /**
   * Returns the base address of the allocated memory space in the WASM heap.
   *
   * @return {number} WASM Heap address.
   */
  getHeapAddress() {
    return this._dataPtr;
  }

  /**
   * Frees the allocated memory space in the WASM heap.
   */
  free() {
    this._isInitialized = false;
    this._module._free(this._dataPtr);
    this._module._free(this._pointerArrayPtr);
    this._channelData = null;
  }
} // class HeapAudioBuffer


/**
 * A JS FIFO implementation for the AudioWorklet. 3 assumptions for the
 * simpler operation:
 *  1. the push and the pull operation are done by 128 frames. (Web Audio
 *    API's render quantum size in the speficiation)
 *  2. the channel count of input/output cannot be changed dynamically.
 *    The AudioWorkletNode should be configured with the `.channelCount = k`
 *    (where k is the channel count you want) and
 *    `.channelCountMode = explicit`.
 *  3. This is for the single-thread operation. (obviously)
 *
 * @class
 */
class RingBuffer {
  /**
   * @constructor
   * @param  {number} length Buffer length in frames.
   * @param  {number} channelCount Buffer channel count.
   */
  constructor(length, channelCount) {
    this._readIndex = 0;
    this._writeIndex = 0;
    this._framesAvailable = 0;

    this._channelCount = channelCount;
    this._length = length;
    this._channelData = [];
    for (let i = 0; i < this._channelCount; ++i) {
      this._channelData[i] = new Float32Array(length);
    }
  }

  /**
   * Getter for Available frames in buffer.
   *
   * @return {number} Available frames in buffer.
   */
  get framesAvailable() {
    return this._framesAvailable;
  }

  /**
   * Push a sequence of Float32Arrays to buffer.
   *
   * @param  {array} arraySequence A sequence of Float32Arrays.
   */
  push(arraySequence) {
    // The channel count of arraySequence and the length of each channel must
    // match with this buffer obejct.

    // Transfer data from the |arraySequence| storage to the internal buffer.
    let sourceLength = arraySequence[0].length;
    for (let i = 0; i < sourceLength; ++i) {
      let writeIndex = (this._writeIndex + i) % this._length;
      for (let channel = 0; channel < this._channelCount; ++channel) {
        this._channelData[channel][writeIndex] = arraySequence[channel][i];
      }
    }

    this._writeIndex += sourceLength;
    if (this._writeIndex >= this._length) {
      this._writeIndex = 0;
    }

    // For excessive frames, the buffer will be overwritten.
    this._framesAvailable += sourceLength;
    if (this._framesAvailable > this._length) {
      this._framesAvailable = this._length;
    }
  }

  /**
   * Pull data out of buffer and fill a given sequence of Float32Arrays.
   *
   * @param  {array} arraySequence An array of Float32Arrays.
   */
  pull(arraySequence) {
    // The channel count of arraySequence and the length of each channel must
    // match with this buffer obejct.

    // If the FIFO is completely empty, do nothing.
    if (this._framesAvailable === 0) {
      return;
    }

    let destinationLength = arraySequence[0].length;

    // Transfer data from the internal buffer to the |arraySequence| storage.
    for (let i = 0; i < destinationLength; ++i) {
      let readIndex = (this._readIndex + i) % this._length;
      for (let channel = 0; channel < this._channelCount; ++channel) {
        arraySequence[channel][i] = this._channelData[channel][readIndex];
      }
    }

    this._readIndex += destinationLength;
    if (this._readIndex >= this._length) {
      this._readIndex = 0;
    }

    this._framesAvailable -= destinationLength;
    if (this._framesAvailable < 0) {
      this._framesAvailable = 0;
    }
  }
} // class RingBuffer


export {
  MAX_CHANNEL_COUNT,
  RENDER_QUANTUM_FRAMES,
  HeapAudioBuffer,
  RingBuffer,
};

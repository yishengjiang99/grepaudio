import { Q, HZ_LIST, DEFAULT_PRESET_GAINS } from "../constants.js";
class BandPassLRCProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ring_buffer = [new Float32Array(), new Float32Array()];
    this.n = 0;
    this.gains = [0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 4.6, 4.5, 6];
    var self = this;
    this.zparams = [];
    for (const fc of HZ_LIST) {
      this.zparams.push(this.paramtersForCenterFrequency(fc));
    }
    this.port.onmessage = function (evt) {
      if (evt.data.gainUpdate) {
        self.gains[evt.data.gainUpdate.index] = evt.data.gainUpdate.value;
        self.port.postMessage({ msg: "gains set to " + self.gains.join(",") });
      }
      if (evt.data.gainUpdates) {
        evt.data.gainUpdates.forEach((update) => {
          self.gains[update.index] = update.value;
        });
        self.port.postMessage({ gainupdates_processed: self.gains });
      }
      self.zparams = [];
      for (const fc of HZ_LIST) {
        self.zparams.push(self.paramtersForCenterFrequency(fc));
      }
      self.port.postMessage({ ztransform: self.zparams });
    };
  }

  process(inputs, outputs, params) {
    const bands = params.bands || HZ_LIST;
    const input = inputs[0];
    const output = outputs[0];
    var z_params = this.zparams;

    const { i0, i1 } = this.last_two_frames();
    var sum = 0;
    var ns = 0;
    var sumin = 0;

    var convert_val = (k) => 31.5 - (k * 31.5) / 12;
    for (let channel = 0; channel < input.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      for (let i = 0; i < outputChannel.length; ++i) {
        var v = inputChannel[i];
        sumin += v * v;
        for (let k = 0; k < bands.length; k++) {
          var v0 = this.ring_buffer[i0][channel * k] || 0; //FOR firs t2 frames. assume previosu 2 aws  samem value
          var v1 = this.ring_buffer[i1][channel * k] || 0;
          var coef = z_params[k];
          var wq = coef.b0 * v + coef.a0 * v0 + v1 * coef.a1;
          v += (wq + v1 * coef.b1) * (Math.pow(10, this.gains[k] / 20) - 1);
          this.ring_buffer[this.n % 2][channel * k] = wq;
        }
        sum += v * v;
        ns++;
        outputChannel[i] = v;
      }
    }

    this.n++;

    if (this.n % 22 == 1 && sumin > 0) {
      this.port.postMessage({
        spl_in: 10 * Math.log10(Math.sqrt(sumin / ns)),
        spl_out: 10 * Math.log10(Math.sqrt(sum / ns)),
      });
    }
    return true;
  }
}

registerProcessor("band_pass_lfc_processor", BandPassLRCProcessor);

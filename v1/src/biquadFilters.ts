// BiquadFilterNode.prototype.toJson = function () {
//   var a = new Float32Array(hz_bands.length);
//   var b = new Float32Array(hz_bands.length);
//   var fr = this.getFrequencyResponse(hz_bands, a, b);
//   return {
//     gain: this.gain.value,
//     frequency: this.frequency.value,
//     type: this.type,
//     q: this.Q.value,
//     FRMag: a,
//     FRPhase: b,
//   };
// };

BiquadFilterNode.prototype.toString = function () {
  return JSON.stringify({
    gain: this.gain.value,
    frequency: this.frequency.value,
    type: this.type,
    q: this.Q.value,
  });
};
const hz_bands = new Float32Array([
  32,
  64,
  125,
  250,
  500,
  1000,
  2000,
  4000,
  8000,
  16000,
]);

type NodeChain = AudioNode[];

export const four_band_filter = function (context: AudioContext): NodeChain {
  const highShelf = context.createBiquadFilter();
  const lowShelf = context.createBiquadFilter();
  const highPass = context.createBiquadFilter();
  const lowPass = context.createBiquadFilter();
  const preamp = context.createGain();
  const postamp = context.createGain();

  preamp.connect(highShelf);
  highShelf.connect(lowShelf);
  lowShelf.connect(highPass);
  highPass.connect(lowPass);
  lowPass.connect(postamp);

  highShelf.type = "highshelf";
  highShelf.frequency.value = 4700;
  highShelf.gain.value = 50;

  lowShelf.type = "lowshelf";
  lowShelf.frequency.value = 35;
  lowShelf.gain.value = 50;

  highPass.type = "highpass";
  highPass.frequency.value = 800;
  highPass.Q.value = 0.7;

  lowPass.type = "lowpass";
  lowPass.frequency.value = 880;
  lowPass.Q.value = 0.7;

  return [preamp, highShelf, lowShelf, highPass, lowPass, postamp];
};

export const twelve_band_filter = function (ctx: AudioContext): NodeChain {
  const bars = [
    { label: "32", frequency: 32, Q: 1, gain: 1, type: "lowshelf" },
    { label: "64", frequency: 64, Q: 2.5, gain: 1, type: "bandpass" },
    { label: "125", frequency: 125, Q: 2.5, gain: 1, type: "bandpass" },
    { label: "250", frequency: 250, Q: 2.5, gain: 1, type: "bandpass" },
    { label: "500", frequency: 500, Q: 2.5, gain: 1, type: "bandpass" },
    { label: "1000", frequency: 1000, Q: 2.5, gain: 1, type: "bandpass" },
    { label: "2k", frequency: 2000, Q: 2.5, gain: 1, type: "bandpass" },
    { label: "4k", frequency: 4000, Q: 2.5, gain: 1, type: "bandpass" },
    { label: "8k", frequency: 8000, Q: 2.5, gain: 1, type: "bandpass" },
    { label: "16k", frequency: 16000, gain: 2.5, type: "highshelf" },
  ];
  type BiquadFilterType =
    | "allpass"
    | "bandpass"
    | "highpass"
    | "highshelf"
    | "lowpass"
    | "lowshelf"
    | "notch"
    | "peaking";

  const chain = bars.map((b) => {
    const { frequency, Q, gain, type } = b;
    return new BiquadFilterNode(ctx, {
      frequency,
      Q,
      gain,
      type: <BiquadFilterType>type,
    });
  });
  chain.reduce((prev, node, idx, arr) => {
    prev && prev.connect(node);
    return node;
  }, null);
  return chain;
};

export default BiquadFilters;

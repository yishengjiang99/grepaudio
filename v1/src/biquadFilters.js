"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.twelve_band_filter = exports.four_band_filter = void 0;
BiquadFilterNode.prototype.toString = function () {
    return JSON.stringify({
        gain: this.gain.value,
        frequency: this.frequency.value,
        type: this.type,
        q: this.Q.value,
    });
};
var hz_bands = new Float32Array([
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
exports.four_band_filter = function (context) {
    var highShelf = context.createBiquadFilter();
    var lowShelf = context.createBiquadFilter();
    var highPass = context.createBiquadFilter();
    var lowPass = context.createBiquadFilter();
    var preamp = context.createGain();
    var postamp = context.createGain();
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
exports.twelve_band_filter = function (ctx) {
    var bars = [
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
    var chain = bars.map(function (b) {
        var frequency = b.frequency, Q = b.Q, gain = b.gain, type = b.type;
        return new BiquadFilterNode(ctx, {
            frequency: frequency,
            Q: Q,
            gain: gain,
            type: type,
        });
    });
    chain.reduce(function (prev, node, idx, arr) {
        prev && prev.connect(node);
        return node;
    }, null);
    return chain;
};
exports.default = BiquadFilters;
//# sourceMappingURL=biquadFilters.js.map
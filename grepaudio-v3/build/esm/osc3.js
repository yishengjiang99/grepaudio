import { __awaiter } from "tslib";
/* eslint-disable no-console */
import { keyboardToFreq, midiToFreq } from "./types";
import { envelope } from "./envelope";
import { getCtx } from "./ctx";
export var NodeLength;
(function (NodeLength) {
    NodeLength[NodeLength["n8"] = 1] = "n8";
    NodeLength[NodeLength["n4"] = 2] = "n4";
    NodeLength[NodeLength["n2"] = 3] = "n2";
    NodeLength[NodeLength["n1"] = 4] = "n1";
    NodeLength[NodeLength["d2"] = 5] = "d2";
    NodeLength[NodeLength["d4"] = 6] = "d4";
})(NodeLength || (NodeLength = {}));
export const defaultOsc3Props = {
    adsr: [0.01, 0.2, 0.3, 0.1],
    detune: [0, 15, 100],
    overtoneAttunuate: [1.2, 0.7, 0.5],
    types: ["square", "sawtooth", "triangle"],
    when: 0,
    duration: 0.125,
};
export const osc3 = (baseNote, _props = {}) => {
    const ctx = getCtx();
    const props = Object.assign(Object.assign({}, defaultOsc3Props), _props);
    const { duration, when, adsr, types } = props;
    const merger = new ChannelMergerNode(ctx, {
        numberOfInputs: 3,
    });
    [baseNote, baseNote * 2, baseNote * 3].map((freq, idx) => {
        const osc = new OscillatorNode(ctx, {
            frequency: freq,
            type: types[idx] || "sine",
        });
        const gain = new GainNode(ctx, { gain: props.overtoneAttunuate[idx] });
        osc.connect(gain).connect(merger, 0, idx);
        osc.start(when);
        osc.stop(when + duration);
    });
    const gain = new GainNode(ctx, { gain: 0 });
    merger.connect(gain);
    return {
        postAmp: gain,
        controller: envelope(gain.gain, adsr, {
            duration: duration,
            maxVolume: 3.5,
            onRelease: () => __awaiter(void 0, void 0, void 0, function* () { return gain.disconnect(); }),
        }),
    };
};
export const osc3run = (baseFrequency, when, duration) => {
    // getInputMixer().push(postAmp, duration);
    setTimeout(() => {
        try {
            const { postAmp, controller } = osc3(baseFrequency, {
                duration: duration,
            });
            debugger;
            postAmp.connect(getCtx().destination);
            console.log("starting in " + when + "seconds");
            controller.triggerAttack();
        }
        catch (e) {
            console.error(e);
        }
    }, when * 1000);
};
export const compression = () => {
    const audioCtx = getCtx();
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
    compressor.knee.setValueAtTime(40, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
    return compressor;
};
export const sequence = (notes) => {
    let start = 0;
    for (let i = 0; i < notes.length; i++) {
        osc3run(notes[i].freq, notes[i].start || start, notes.length * 0.075);
        start += notes.length * 0.075;
    }
};
export const compose = (stave, tempo = 120) => {
    stave.split("").map((chr, idx) => {
        console.log("playing", chr, "at ", keyboardToFreq(chr, 3), (idx * 60) / tempo);
        osc3run(keyboardToFreq(chr, 3), (idx * 60) / tempo, 60 / tempo);
    });
};
export const scale = (midi) => {
    sequence([0, 2, 4, 5, 7, 9, 11, 12].map((inc) => {
        return { freq: midiToFreq(midi + inc), length: NodeLength.n8 };
    }));
};
//# sourceMappingURL=osc3.js.map
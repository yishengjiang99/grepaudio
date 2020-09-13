"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const getOutputBuffer_1 = require("./getOutputBuffer");
exports.test = async () => {
    const ctx = new AudioContext();
    ctx.createOscillator();
    const osc = new OscillatorNode(ctx, {
        frequency: 440,
        type: "sine",
    });
    osc.start();
    const samples = await getOutputBuffer_1.getOutputBuffer(osc, 100);
    osc.stop(2);
    globalThis.output(samples.join(","));
};
//# sourceMappingURL=test_oscillator.js.map
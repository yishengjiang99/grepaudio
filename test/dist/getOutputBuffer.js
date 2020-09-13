"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutputBuffer = void 0;
exports.getOutputBuffer = async (node, ms) => {
    const sampleRate = node.context.sampleRate;
    const samples = new Float32Array((ms * sampleRate) / 1000);
    let ptr = 0;
    const proc = node.context.createScriptProcessor((ms / 1000) * node.context.sampleRate, 2);
    node.connect(proc).connect(node.context.destination);
    return await new Promise((resolve) => {
        proc.onaudioprocess = (e) => {
            for (let channel = 0; channel < e.inputBuffer.numberOfChannels; channel++) {
                const inputData = e.inputBuffer.getChannelData(channel);
                for (let i = 0; i < inputData.length; i++) {
                    e.outputBuffer[channel] = inputData[i];
                    samples[ptr++] = inputData[i];
                    if (ptr >= samples.length) {
                        resolve(samples);
                    }
                }
            }
        };
    });
};
//# sourceMappingURL=getOutputBuffer.js.map
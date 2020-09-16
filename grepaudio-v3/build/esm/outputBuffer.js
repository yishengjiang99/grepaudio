import { __awaiter } from "tslib";
import { getCtx } from './ctx';
;
export const defaultProps = {
    length: 1000,
    output: new Float32Array(length * getCtx().sampleRate / 1000),
    transform: (x) => x,
    outlet: getCtx().destination
};
export function outputBuffer(node, props) {
    const { length, output, transform, outlet } = Object.assign(Object.assign({}, defaultProps), props);
    let ptr = 0;
    const proc = node.context.createScriptProcessor(2 << 9, 2, 2);
    node.connect(proc);
    if (outlet)
        proc.connect(outlet);
    const sampleGot = new Promise(resolve => {
        proc.onaudioprocess = (e) => {
            for (let channel = 0; channel < e.inputBuffer.numberOfChannels; channel++) {
                const inputData = e.inputBuffer.getChannelData(channel);
                for (let i = 0; i < inputData.length; i++) {
                    e.outputBuffer[channel] = inputData[i];
                    output[ptr++] = transform(inputData[i]);
                    if (ptr >= output.length) {
                        resolve(output);
                    }
                }
            }
        };
    });
    return {
        node: proc,
        samples: () => __awaiter(this, void 0, void 0, function* () { return yield sampleGot; })
    };
}
/*

    // splitter.connect(node.context.destination, 0);
    return await new Promise((resolve) => {
        proc.onaudioprocess = (e: AudioProcessingEvent) => {
            for (
                let channel = 0;
                channel < e.inputBuffer.numberOfChannels;
                channel++
            ) {
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
 
//# sourceMappingURL=outputBuffer.js.map
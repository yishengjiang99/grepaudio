import { AudioWorkletProcessor, registerProcessor } from "../types";
import { SharedRingBuffer } from "../shared-ring-buffer";
const bufferSampleSize = 2 << 11;
const sizePerSample = 4;
class UploadProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        const sharedBuffer = new SharedArrayBuffer(bufferSampleSize * Float32Array.BYTES_PER_ELEMENT +
            Uint16Array.BYTES_PER_ELEMENT +
            Uint16Array.BYTES_PER_ELEMENT);
        this.sharedBuffer = new SharedRingBuffer(sharedBuffer);
        this.worker = new Worker("./upload-worker");
        this.worker.postMessage({
            buffer: sharedBuffer,
        });
        this.worker.onmessage = ({ data }) => this.port.postMessage("initialized");
    }
    process(inputs, outputs, parameters) {
        for (let channel = 0; channel < inputs.length; channel++) {
            for (let i = 0; i < inputs[channel].length; i++) {
                outputs[channel][i] = inputs[channel][i];
            }
            this.sharedBuffer.write(inputs[channel]);
        }
        return true;
    }
}
registerProcessor("upload-processor", UploadProcessor);
//# sourceMappingURL=upload-processor.js.map
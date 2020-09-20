import { getCtx } from "./ctx";

export async function loadInlineWorklet({ className, classDesc, onInit, onMessage, onProc }) {
	const template = /* javascript */ `
    ${offlineDiskJS}
	class ${className} extends AudioWorkletProcessor {
		constructor(options) {
            super(options);
            const wctx = this;
            this.port.onmessage = ({data})=>{
                ${onMessage}
            }
            ${onInit}
        }
		process(inputs, outputs, params) {
			const input = inputs[0];
            const output = outputs[0];
            const wctx=this;
            let send = false;
			for (let channel = 0; channel < input.length; ++channel) {

                const inputChannel = input[channel];
				const outputChannel = output[channel];
				for (let i = 0; i < outputChannel.length; ++i) {
                    outputChannel[i]=inputChannel[i];
                    if(!send && i < 20 && inputChannel[i]>0.1){
                        send=true;
                    }
				}
            }
            if(send){
                ${onProc};
            }
            return true;
        }
	}
	registerProcessor( "${classDesc}",${className});
`;
	const blobUrl = URL.createObjectURL(new Blob([template], { type: "text/javascript" }));
	const ctx = getCtx();
	await ctx.audioWorklet.addModule(blobUrl);
	return new AudioWorkletNode(ctx, classDesc);
}

var offlineDiskJS = `
const metaSection = Uint16Array.BYTES_PER_ELEMENT * 2;
const timeSection = Uint32Array.BYTES_PER_ELEMENT * 1;
 class SharedRingBuffer {
    constructor(sharedBuffer) {
        this.stateBuffer = new Uint16Array(sharedBuffer, 0, 2);
        this._lastUpdate = new Uint32Array(sharedBuffer, metaSection, 1);
        this.dataBuffer = new Float32Array(sharedBuffer, metaSection + timeSection);
        this.bufferSize = sharedBuffer.byteLength - metaSection - timeSection;
    }
    writeBinurally(left, right) {
        let wptr = this.wPtr;
        for (let i = 0; left[i] || right[i]; i++) {
            if (wptr) {
                this.dataBuffer[wptr++ % this.bufferSize] = left[i];
                this.dataBuffer[wptr++ % this.bufferSize] = right[i];
            }
        }
        this.wPtr = wptr;
    }
    write(ab) {
        let wptr = this.wPtr;
        for (let i = 0; i < ab.length; i++) {
            this.dataBuffer[wptr++ % this.bufferSize] = ab[i];
        }
        this.wPtr = wptr;
    }
    read(n, output) {
        let ptr = this.readPtr;
        output = output || new Float32Array(n);
        for (let i = 0; i < n && ptr <= this.wPtr; i++) {
            output[i] = this.dataBuffer[ptr++ % this.bufferSize];
        }
        this.readPtr = ptr;
        return output;
    }
    readToBuffer(outputBuffer) {
        return this.read(Math.min(this.wPtr - this.readPtr), outputBuffer);
    }
    get buffer() {
        return this.dataBuffer;
    }
    get wPtr() {
        return Atomics.load(this.stateBuffer, 0);
    }
    set wPtr(value) {
        Atomics.store(this.stateBuffer, 0, value % this.bufferSize);
    }
    get readPtr() {
        return Atomics.load(this.stateBuffer, 1);
    }
    set readPtr(value) {
        Atomics.store(this.stateBuffer, 1, value % this.bufferSize);
    }
    get lastUpdate() {
        return Atomics.load(this._lastUpdate, 0) + 1600235779107;
    }
    logUpdate() {
        const now = new Date().getTime() - 1600235779107;
        Atomics.store(this._lastUpdate, 0, now);
    }
}`;

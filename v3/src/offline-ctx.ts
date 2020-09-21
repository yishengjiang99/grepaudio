import { getCtx } from "./ctx";
import { trap_resp_key, trap_signal } from "./trap_signal";
import { SharedRingBuffer as gg } from "./shared-ring-buffer";

type Javascript = string;
type JavaScriptClassName = string;
type JavascripCallbackHandler = string;

interface LoadInlineworkletProp {
	inlineJSLib?: Javascript;
	className: JavaScriptClassName;
	classDesc: string;
	onInit?: Javascript;
	onMessage?: JavascripCallbackHandler;
	onProc?: Javascript;
}
const defaultProps: LoadInlineworkletProp = {
	inlineJSLib: "",
	className: "Example",
	classDesc: "procs-windfury",
	onInit: "",
	onMessage: "",
	onProc: "",
};
type loadInlineWorkletFunction = (props: LoadInlineworkletProp) => Promise<AudioWorkletNode>;

export const loadInlineWorklet: loadInlineWorkletFunction = async (props) => {
	const { inlineJSLib, className, classDesc, onInit, onMessage, onProc } = { ...defaultProps, ...props };
	const template = /* javascript */ `
    /* javascript */
    ${inlineJSLib}
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
};

// export const teeWorklet = async (
// 	sharedBuffer: SharedArrayBuffer = new SharedArrayBuffer(16 * 1024)
// ): Promise<AudioWorkletNode> => {
// 	try {
// 		const tee: AudioWorkletNode = await loadInlineWorklet({
// 			inlineJSLib: inlineJSLib,
// 			className: "Upload",
// 			classDesc: "upload-processor",
// 			onInit: `
//             this.paused = false;
//             this.port.postMessage({msg: "init"});`,
// 			onMessage: `
//             if(data.sharedBuffer){
//                 this.disk = new i(data.sharedBuffer);
//                 this.port.postMessage({sharedBufferGot:1});
//             }
//             if(data.cmd) switch(data.cmd) {
//                 case 'pause': this.paused = true; break;
//                 case 'start': this.paused = false; break;
//                 case 'post': this.port.postMessage(this.disk.dataBuffer));break;
//             }`,
// 			onProc: `if(this.disk && !this.paused) {
//                 this.disk.write(input);
//                 this.port.postMessage({msg: this.disk.wPtr})
//             }`,
// 		});
// 		const sharedBufferGot = new Promise((resolve) => {
// 			tee.port.onmessage = ({ data }) => {
// 				data.sharedBufferGot && resolve();
// 			};
// 		});
// 		tee.port.postMessage({ sharedBuffer });
// 		await sharedBufferGot;
// 		return tee;
// 	} catch (e) {
// 		alert(e.message);
// 	}
// };

export const inlineJSLib = `class SharedRingBuffer {
    constructor(sharedBuffer) {
        const metaSection = Uint16Array.BYTES_PER_ELEMENT * 2;
        const timeSection = Int32Array.BYTES_PER_ELEMENT * 1;
        this.stateBuffer = new Uint16Array(sharedBuffer, 0, 2);
        this._lastUpdate = new Int32Array(sharedBuffer, metaSection, 1);
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
    readToUint16Array(output) {
        let ptr = this.readPtr;
        for (let i = 0; i < output.length && ptr <= this.wPtr; i++) {
            const d = this.dataBuffer[ptr++ % this.bufferSize];
            output[i] = d < 0 ? 0x8000 & d : 0x7ffff & d;
        }
        this.readPtr = ptr;
        return output;
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
        this.logUpdate();
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

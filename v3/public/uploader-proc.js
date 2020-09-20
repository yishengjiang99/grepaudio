import { sharedRingBuffer } from "/js/shared-ring-buffer.js";

class Upload extends AudioWorkletProcessor {
	constructor(options) {
		super(options);
		this.disk = sharedRingBuffer(new SharedArrayBuffer(4 * 1024));
		const wctx = this;
		this.onProc = (wctx, input) => this.wctx.write(input);
		this.onInit = () => {
			// wctx.sharedBuffer = new SharedArrayBuffer(1024 * 4);
		};

		this.port.onMessage = ({ cmd, args }) => {};
		this.onInit();
	}

	process(inputs, outputs, params) {
		const input = inputs[0];
		const output = outputs[0];
		const wctx = this;
		this.onProc(wctx, input);
		for (let channel = 0; channel < input.length; ++channel) {
			const inputChannel = input[channel];
			const outputChannel = output[channel];
			for (let i = 0; i < outputChannel.length; ++i) {
				outputChannel[i] = inputChannel[i];
			}
		}
		return true;
	}
}
registerProcessor("upload-processor", Upload);

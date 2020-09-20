// /* eslint-disable no-console */
// import { expect } from "chai";
// import { getCtx } from "./ctx";
// import { osc3 } from "./osc3";
// import { outputBuffer } from "./outputBuffer";
// import { SharedRingBuffer } from "./shared-ring-buffer";

// describe("upload worker", () => {
// 	it.skip("operates offline", () => {
// 		//	const worker = new Worker("base/src/upload-worker.js");
// 		const sharedBuffer = ghettoStart("wss://www.grepawk.com/stdin");
// 		expect(sharedBuffer).to.exist;
// 		const ringbuffer = new SharedRingBuffer(sharedBuffer);
// 		const osc = osc3(322);
// 		const output = new Float32Array(getCtx().sampleRate);
// 		outputBuffer(osc.postAmp, {
// 			outlet: getCtx().destination,
// 			length: getCtx().sampleRate,
// 			output,
// 			onData: () => {
// 				ringbuffer.write(output);
// 			},
// 		});
// 	});
// });

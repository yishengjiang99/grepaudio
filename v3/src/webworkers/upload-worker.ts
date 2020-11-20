import { globalObject } from "../types";
import { SharedRingBuffer } from "../shared-ring-buffer";
import { trap_signal, signal_listen_non_block } from "../trap_signal";
let self = globalObject;
self.signal = 1;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const postMessage = globalObject.postMessage;
(async function () {
	const total_buffer_size = 16 * 1024;
	const AU_PACKET = 128 * 2;
	const transportBuffer = new Uint16Array(AU_PACKET);
	const sharedBuffer = new SharedArrayBuffer(total_buffer_size);
	const sharedRing = new SharedRingBuffer(sharedBuffer);
	postMessage({ sharedBuffer });
	await new Promise((resolve) => (self.onmessage = resolve));
	signal_listen_non_block(self);
	const wss = new WebSocket("ws://localhost:5150");
	//const wss = new WebSocket("wss://www.grepawk.com/stdin");

	await new Promise((resolve) => (wss.onopen = () => resolve()));
	postMessage({ msg: "wsOpen" });
	async function loop() {
		const availableFrames = sharedRing.wPtr - sharedRing.readPtr;
		if (availableFrames >= 0) {
			sharedRing.readToUint16Array(transportBuffer);
			wss.send(transportBuffer);
		}
		await sleep(10);
		postMessage({ msg: sharedRing.readPtr + " sent" });

		loop();
	}
	loop();
})();

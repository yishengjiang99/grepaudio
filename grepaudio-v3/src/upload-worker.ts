/* eslint-disable no-console */
import { shareOutputBuffer } from "./share-sound-buffer";
import { SharedRingBuffer } from "./shared-ring-buffer";
export const uploadWorker: Worker = self as any;

let sharedArrayBuffer: SharedArrayBuffer, sharedRingBuffer: SharedRingBuffer, ws: WebSocket, uploadBuffer: Float32Array;

uploadWorker.addEventListener("message", ({ data }: MessageEvent) => {
	if (data.sharedRingBuffer) {
		sharedRingBuffer = data.sharedRingBuffer;
	} else if (data.pushed) {
	}
});

const bufferByteSize = 10240;

export const ghettoStart = (uplink) => {
	sharedArrayBuffer = new SharedArrayBuffer(bufferByteSize);

	sharedRingBuffer = new SharedRingBuffer(sharedArrayBuffer);
	uploadBuffer = new Float32Array(bufferByteSize);
	ws = new WebSocket("wss://www.grepawk.com/stdin");
	ws.onopen = () => {
		ws.onmessage = (msg) => console.log(msg);
		function loop() {
			sharedRingBuffer.readToBuffer(uploadBuffer);
			ws.send(uploadBuffer);
			requestAnimationFrame(loop);
		}
		loop();
	};
	return sharedArrayBuffer;
};

uploadWorker.addEventListener("message", ({ data }: MessageEvent) => {
	if (!data || !data.message) return;
	const [cmd, arg1, arg2] = data.message.split(" ");
	if (cmd === "start") {
		const uplink = arg1 || "https://www.grepawk.com/stdin" + "/" + (arg2 || "");
		sharedArrayBuffer = ghettoStart(uplink);
		postMessage(
			{
				sbs: sharedArrayBuffer,
			},
			""
		);
	}
});

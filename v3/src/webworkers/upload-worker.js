onmessage = function (e) {
	const metaSection = Uint16Array.BYTES_PER_ELEMENT * 2;
	const timeSection = Int32Array.BYTES_PER_ELEMENT * 1;
	const AU_PACKET = 128 * 2;
	const sharedBuffer = new SharedArrayBuffer(16 * 1024);
	const dataBuffer = new Float32Array(sharedBuffer, metaSection + timeSection);
	const stateBuffer = new Uint16Array(sharedBuffer);
	const updatedBuffer = new Int32Array(sharedBuffer, metaSection, 1);
	const lastUpdate = () => Atomics.load(updatedBuffer, 0);
	const bufferSize = sharedBuffer.byteLength - metaSection - timeSection;
	const availableFrames = () => [Atomics.load(stateBuffer, 0), Atomics.load(stateBuffer, 1)];
	const dataViews = new DataView(sharedBuffer);
	const readablePCMString = () =>
		new ReadableStream({
			start: (controller) => {
				function loop() {
					const output = new Uint16Array(AU_PACKET);
					const [from, to] = availableFrames();
					if (from === to) {
						Atomics.wait(updatedBuffer, 1, to);
					}
					for (let i = from, n = 0; i <= to && i < AU_PACKET; i++, n++) {
						output[n] = dataBuffer[i++ % bufferSize] < 0 ? 0x8000 : 0x7fff;
					}
					controller.enqueue(output);
				}
				loop();
			},
		});

	postMessage({ sharedBuffer });
	const ws = new WebSocket("wss://www.grepawk.com/stdin");
	ws.onopen = () => {
		ws.onmessage = (msg) => console.log(msg);
	};
};

const pageBlock = 4 * 1024;
const sampleRate = 44100;
export const signed16ToFloat32 = () => {
	const uint8ToFloat = (int1, int2) => {
		if (int2 & 0x80) {
			return -(0x10000 - ((int2 << 8) | int1)) / 0x8000;
		} else {
			return ((int2 << 8) | int1) / 0x7fff;
		}
	};
	return new TransformStream<Uint8Array, Float32Array>({
		transform: (chunk, controller) => {
			const fl = new Float32Array(chunk.byteLength / 2);
			for (let i = 0, j = 0; i < chunk.length - 1; i += 2) {
				fl[j++] = uint8ToFloat(chunk[i], chunk[i + 1]);
			}
			controller.enqueue(fl);
		},
	});
};
export const fl32ToAudioBuffer = () => {
	return new TransformStream<Float32Array, AudioBuffer>({
		transform: (chunk, controller) => {
			const ob = new AudioBuffer({ length: chunk.length, sampleRate: sampleRate, numberOfChannels: 2 });
			ob.copyToChannel(
				chunk.filter((v, i) => i & 1 && v),
				0
			);
			ob.copyToChannel(
				chunk.filter((v, i) => i & 1 || v),
				0
			);
			ob.copyFromChannel(chunk, 0, 0);
			ob.copyFromChannel(chunk, 1, chunk.length / 2);
			controller.enqueue(ob);
		},
	});
};

export const fetchChain = (url) => {
	const ctx = new AudioContext();
	fetch(url)
		.then((resp) => resp.body)
		.then((rs: ReadableStream<Uint8Array>) => rs.pipeThrough(signed16ToFloat32()))
		.then((rs: ReadableStream<Float32Array>) => rs.pipeThrough(fl32ToAudioBuffer()))
		.then(async (rs: ReadableStream<AudioBuffer>) => {
			const q = [];
			const reader = rs.getReader();
			reader.read().then(async ({ value, done }) => {
				if (done) return;
				else {
					q.push(new AudioBufferSourceNode(ctx, { buffer: value }));
					if (q.length > 100) {
						console.log(q.length);
					} else {
						await new Promise((resolve) => setTimeout(resolve, 100));
					}
				}
			});

			return q;
		})
		.then((q) => {
			while (true) {
				q.shift().connect(ctx.destination);
			}
		});
};

import { getCtx } from "./ctx";
<<<<<<< Updated upstream

=======
import { envelope } from "./envelope";
>>>>>>> Stashed changes
export const whiteNoise = () => {
	const audioCtx = getCtx();
	// Create an empty three-second stereo buffer at the sample rate of the AudioContext
	const myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * 3, audioCtx.sampleRate);

	// Fill the buffer with white noise;
	// just random values between -1.0 and 1.0
	for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
		// This gives us the actual ArrayBuffer that contains the data
		const nowBuffering = myArrayBuffer.getChannelData(channel);
		for (let i = 0; i < myArrayBuffer.length; i++) {
			// Math.random() is in [0; 1.0]
			// audio needs to be in [-1.0; 1.0]
			nowBuffering[i] = Math.random() * 2 - 1;
		}
	}

	// Get an AudioBufferSourceNode.
	// This is the AudioNode to use when we want to play an AudioBuffer
	const source = audioCtx.createBufferSource();

	// set the buffer in the AudioBufferSourceNode
	source.buffer = myArrayBuffer;
	const g = new GainNode(audioCtx, { gain: 0 });
	source.connect(g);
<<<<<<< Updated upstream
	source.start(0);
=======
	source.repeat = true;
	source.connect(audioCtx.destination);
>>>>>>> Stashed changes
	return source;
};

export function loadURL(url): Promise<AudioBufferSourceNode> {
	return new Promise((r, reject) => {
		const ctx = getCtx();
		const xhr = new XMLHttpRequest();
		xhr.open("get", url, true);
		xhr.responseType = "arraybuffer";
		xhr.setRequestHeader("Range", "Bytes:0-");
		xhr.onreadystatechange = () => {
			if (xhr.response) {
				const source = ctx.createBufferSource();
				ctx.decodeAudioData(xhr.response, (processed) => {
					source.buffer = processed;

					r(source);
				});
			}
		};
		xhr.onerror = reject;
		xhr.send();
	});
}

import { createDiv, ensureDiv, getCtx } from "./ctx";
import { ADSR, midiToFreq } from "./types";
import { envelope } from "./envelope";
// import { A3, B3, C3, D3, G3, F3, Bb3 } from "../public/db/FatBoy_acoustic_grand_piano";
export const whiteNoise = ({ adsr }) => {
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
	const g = new GainNode(audioCtx, { gain: 2 });
	source.connect(g);
	source.start(0);
	envelope(g.gain, adsr, {}).triggerAttackRelease();
	return g;
};
export const loadBase64 = (midiString: string) => {
	const ctx = getCtx();
	const audioTag = createDiv(`audio`);
	const source = new MediaElementAudioSourceNode(ctx, { mediaElement: audioTag });
	source.connect(ctx.destination);
	audioTag.controls = true;
	audioTag.src = "http://localhost/synth.php?f=" + midiToFreq(midiString);
	audioTag.autoplay = true;
	return source;
};

export function loadBuffer(url, ctx) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		const ctx = getCtx();
		var source = ctx.createBufferSource();
		xhr.open("get", url, true);
		xhr.responseType = "arraybuffer";
		xhr.setRequestHeader("Range", "Bytes:0-");
		var counter = 0;
		xhr.onload = function (evt) {
			ctx.decodeAudioData(xhr.response, function (processed) {
				source.buffer = processed;
				resolve(source);
			});
		};

		xhr.send();
	});
}
export function load32() {
	let ab = fetch("/f32le-0.5.pcm")
		.then((resp) => resp.arrayBuffer())
		.then((_ab) => (ab = _ab));
	return ab;
}

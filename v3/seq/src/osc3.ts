///<reference path="./types.d.ts" />;
import { envelope } from "./envelope";
import { OSC3Props, Frequency } from "./types";

export const defaultOsc3Props: OSC3Props = {
	adsr: [0.01, 0.2, 0.3, 0.1],
	detune: [0, 15, 100],
	overtoneAttunuate: [1.2, 0.7, 0.5],
	types: ["square", "sine", "sine"],
	when: 0,
	duration: 0.125,
	harmonicity: [0, 0.5, 1],
};

export const osc3 = (baseNote: Frequency, _props: OSC3Props = {}) => {
	const ctx = globalThis.ctx;
	const props: OSC3Props = {
		...defaultOsc3Props,
		..._props,
	};
	const { duration, when, adsr, types } = props;
	const merger = new ChannelMergerNode(ctx, {
		numberOfInputs: 3,
	});
	const oscillators = [baseNote, baseNote * 2, baseNote * 3].map((freq, idx) => {
		const osc = new OscillatorNode(ctx, {
			frequency: freq,
			type: types[idx] || "sine",
		});
		const gain = new GainNode(ctx, { gain: props.overtoneAttunuate[idx] });
		osc.connect(gain).connect(merger, 0, idx);
		osc.start();
		return osc;
	});
	const gain = new GainNode(ctx, { gain: 0 });
	merger.connect(gain);
	const { triggerAttackRelease, triggerAttack, triggerRelease } = envelope(gain.gain, _props.adsr, {
		duration: duration,
		maxVolume: 3.5,
		onRelease: async () => gain.disconnect(),
	});
	function setFrequency(freqs: Frequency[]) {
		[0, 1, 2].map((i) => {
			const f = freqs[i] || freqs[0] * _props.harmonicity[i];
			oscillators[i].frequency.linearRampToValueAtTime(f, ctx.currentTime + 0.001);
		});
	}
	return {
		nodes: oscillators,
		postAmp: gain,
		setFrequency: setFrequency,
		triggerAttackRelease,
		triggerAttack,
		triggerRelease,
	};
};

export const osc3run = (baseFrequency: Frequency, when?: number, duration?: number) => {
	const { postAmp, triggerAttackRelease } = osc3(baseFrequency, {
		duration: duration || 0.25,
	});
	triggerAttackRelease();
};

export const compression = () => {
	const audioCtx = globalThis.ctx; //();
	const compressor = audioCtx.createDynamicsCompressor();
	compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
	compressor.knee.setValueAtTime(40, audioCtx.currentTime);
	compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
	compressor.attack.setValueAtTime(0, audioCtx.currentTime);
	compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
	return compressor;
};

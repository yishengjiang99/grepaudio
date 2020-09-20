import { ADSR, Frequency, Midi, midiToFreq, Percent } from "./types";
import { envelope, EnvelopeControl } from "./envelope";
import { getCtx, getInputMixer } from "./ctx";
export const frequencyToMidi = (f: Frequency): Midi => ~~(12 * Math.log2(f / 440) + 69);
export interface OSC3Props {
	hpf?: Frequency;
	adsr?: ADSR;
	when?: number;
	detune?: number[];
	duration?: number;
	types?: OscillatorType[];
	overtoneAttunuate?: [Percent, Percent, Percent];
}
export enum NodeLength {
	n8 = 1,
	n4,
	n2,
	n1,
	d2,
	d4,
}
export interface Note {
	freq: Frequency;
	start?: number;
	length: NodeLength;
}
export const defaultOsc3Props: OSC3Props = {
	adsr: [0.01, 0.2, 0.3, 0.1],
	detune: [0, 15, 100],
	overtoneAttunuate: [1.2, 0.7, 0.5],
	types: ["triangle", "triangle", "square"],
	when: 0,
	duration: 0.125,
};

export const osc3 = (
	baseNote: Frequency,
	_props: OSC3Props = {}
): {
	postAmp: GainNode;
	controller: EnvelopeControl;
} => {
	const ctx = getCtx();
	const props: OSC3Props = {
		...defaultOsc3Props,
		..._props,
	};
	const { duration, when, adsr, types } = props;
	const merger = new ChannelMergerNode(ctx, {
		numberOfInputs: 3,
	});
	[baseNote, baseNote * 2, baseNote * 3].map((freq, idx) => {
		const osc = new OscillatorNode(ctx, {
			frequency: freq,
			type: types[idx] || "sine",
		});
		const gain = new GainNode(ctx, { gain: props.overtoneAttunuate[idx] });
		osc.connect(gain).connect(merger, 0, idx);
		osc.start();
	});
	const gain = new GainNode(ctx, { gain: 0 });
	merger.connect(gain);

	return {
		postAmp: gain,
		controller: envelope(gain.gain, props.adsr, {
			duration: duration,
			maxVolume: 3.5,
			// onRelease: async () => gain.disconnect(),
		}),
	};
};

export const osc3run = (baseFrequency: Frequency, when?: number, duration?: number) => {
	const { postAmp, controller } = osc3(baseFrequency, {
		duration: duration || 0.25,
	});
	getInputMixer().push(postAmp, duration);
	setTimeout(() => {
		controller.triggerAttackRelease();
	}, when * 1000);
};

export const compression = () => {
	const audioCtx = getCtx();
	const compressor = audioCtx.createDynamicsCompressor();
	compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
	compressor.knee.setValueAtTime(40, audioCtx.currentTime);
	compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
	compressor.attack.setValueAtTime(0, audioCtx.currentTime);
	compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
	return compressor;
};

export const sequence = (notes: Note[]) => {
	let start = 0;

	for (let i = 0; i < notes.length; i++) {
		osc3run(notes[i].freq, notes[i].start || start, notes.length * 0.075);
		start += notes.length * 0.075;
	}
};

export const scale = (midi: Midi) => {
	sequence(
		[0, 2, 4, 5, 7, 9, 11, 12].map((inc) => {
			return { freq: midiToFreq(midi + inc), length: NodeLength.n8 };
		})
	);
};

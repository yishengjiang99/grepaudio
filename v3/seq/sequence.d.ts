declare interface OSC3Props {
	hpf?: Frequency;
	adsr?: ADSR;
	when?: number;
	detune?: number[];
	duration?: number;
	types?: OscillatorType[];
	harmonicity?: number[];
	overtoneAttunuate?: [Percent, Percent, Percent];
}
declare type CallBack = (e: Event) => {};

declare type Percent = number; // TODO: put conditional guards here when I figure out how to do them
declare type ADSR = [Seconds, Seconds, Percent, Seconds];
declare type Seconds = number;
declare enum NodeLength {
	n8 = 1,
	n4,
	n2,
	n1,
	d2,
	d4,
}
declare interface Note {
	freq: Frequency;
	start?: number;
	length: NodeLength;
}
declare type Osc3 = {
	nodes: OscillatorNode[];
	postAmp: GainNode;
	setFrequency: (f: Frequency[]) => void;
} & EnvelopeControl;

type EnvelopeControl = {
	triggerAttack: () => void;
	triggerRelease: () => void;
	triggerAttackRelease: () => void;
};
type Frequency = number;

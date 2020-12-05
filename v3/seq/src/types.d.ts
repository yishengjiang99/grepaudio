export interface OSC3Props {
	hpf?: Frequency;
	adsr?: ADSR;
	when?: number;
	detune?: number[];
	duration?: number;
	types?: OscillatorType[];
	harmonicity?: number[];
	overtoneAttunuate?: [Percent, Percent, Percent];
}
export type CallBack = (e: Event) => {};

export type Percent = number; // TODO: put conditional guards here when I figure out how to do them
export type ADSR = [Seconds, Seconds, Percent, Seconds];
export type Seconds = number;
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
export type Osc3 = {
	nodes: OscillatorNode[];
	postAmp: GainNode;
	setFrequency: (f: Frequency[]) => void;
} & EnvelopeControl;

export type EnvelopeControl = {
	triggerAttack: () => void;
	triggerRelease: () => void;
	triggerAttackRelease: () => void;
};
export type Frequency = number;

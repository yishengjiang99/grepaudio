import { getCtx } from "./ctx";
import { ADSR, Seconds } from "./types";

export type EnvelopeControl = {
	triggerAttack: () => void;
	triggerRelease: () => void;
	triggerAttackRelease: () => void;
};

export function envelope(
	attribute: AudioParam,
	adrs: ADSR,
	opts?: {
		duration?: Seconds;
		maxVolume?: number;
		onRelease?: () => {};
	}
): EnvelopeControl {
	const [attack, decay, release, sustain] = adrs;
	const maxVolume = opts.maxVolume || 3;
	const { onRelease, duration } = opts || {};
	const ctx = getCtx();
	return {
		triggerAttack: () => {
			attribute.linearRampToValueAtTime(maxVolume, ctx.currentTime + attack);
			attribute.linearRampToValueAtTime(maxVolume * sustain, ctx.currentTime + attack + decay);
		},
		triggerRelease: () => {
			attribute.linearRampToValueAtTime(0, ctx.currentTime + release);
			onRelease && setTimeout(onRelease, release);
		},
		triggerAttackRelease: () => {
			attribute.linearRampToValueAtTime(maxVolume, ctx.currentTime + attack);
			attribute.linearRampToValueAtTime(maxVolume * sustain, ctx.currentTime + attack + decay);
			setTimeout(() => {
				attribute.linearRampToValueAtTime(0, ctx.currentTime + release);
				onRelease && setTimeout(onRelease, release);
			}, duration * 1000 - attack - decay - release);
		},
	};
}

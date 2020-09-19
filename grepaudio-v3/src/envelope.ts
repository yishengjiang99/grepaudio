import { getCtx } from "./ctx";
import { ADSR, Seconds } from "./types";

export type EnvelopeControl = {
	triggerAttack: () => void;
	triggerRelease: () => void;
	triggerAttackRelease: (hold?: Seconds) => void;
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
	const { onRelease } = opts || {};
	const ctx = getCtx();
	return {
		triggerAttack: () => {
			attribute.linearRampToValueAtTime(maxVolume, ctx.currentTime + attack);
			setTimeout(() => {
				attribute.linearRampToValueAtTime(maxVolume * sustain, ctx.currentTime + decay);
			}, attack);
		},
		triggerRelease: () => {
			attribute.cancelAndHoldAtTime(0);
			attribute.linearRampToValueAtTime(0, ctx.currentTime + release);
			onRelease && setTimeout(onRelease, release);
		},
		triggerAttackRelease: (hold = 0.05) => {
			attribute.linearRampToValueAtTime(maxVolume, ctx.currentTime + attack);
			setTimeout(() => {
				attribute.linearRampToValueAtTime(maxVolume * sustain, ctx.currentTime + decay);
				setTimeout(() => {
					attribute.linearRampToValueAtTime(0, ctx.currentTime + release);
				}, opts.duration - attack - decay);
			}, attack);
		},
	};
}

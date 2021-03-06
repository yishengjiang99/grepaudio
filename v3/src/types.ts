export type Frequency = number;
export type Midi = number;
export type Seconds = number;

export type CallBack = (e: Event) => {};
export const midiToFreq = (midi) => {
	return Math.pow(2, (midi - 69) / 12) * 440;
};
export type Percent = number; // TODO: put conditional guards here when I figure out how to do them
export type ADSR = [Seconds, Seconds, Percent, Seconds];

export type Milliseconds = number;
export const sleep = async function (ms) {
	new Promise((resolve) => setTimeout(resolve, ms));
};
export const cdiv = (tag: string, attributes: { [k: string]: string }, children: HTMLElement[] = []) => {
	const div = document.createElement(tag);
	Object.keys(attributes).map((k) => {
		div[k] = attributes[k];
	});
	children.map((c) => div.append(c));
	return div;
};
// https://rjzaworski.com/2019/10/event-emitters-in-typescript
type EventMap = Record<string, any>;

type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
	on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
	off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
	emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}
export function eventEmitter<T extends EventMap>(): Emitter<T> {
	const listeners: {
		[K in keyof EventMap]?: Array<(p: EventMap[K]) => void>;
	} = {};

	return {
		on(key, fn) {
			listeners[key] = (listeners[key] || []).concat(fn);
		},
		off(key, fn) {
			listeners[key] = (listeners[key] || []).filter((f) => f !== fn);
		},
		emit(key, data) {
			(listeners[key] || []).forEach((fn) => {
				fn(data);
			});
		},
	};
}

// https://github.com/Microsoft/TypeScript/issues/20595#issuecomment-351030256
export const globalObject: any = (function (): any {
	if (typeof window !== "undefined") {
		// window is defined in browsers
		return window;
	} else if (typeof self !== "undefined") {
		// self is defined in WebWorkers
		return self;
	}
})();

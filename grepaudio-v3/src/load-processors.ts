import { Callback, ErrorCallback } from "./types";

export function loadAsBlob(js: string[] | string, onMessage: Callback, onError: ErrorCallback) {
	try {
		const file = URL.createObjectURL(new Blob([].concat(js), { type: "text/javascript" }));
		const worker = new Worker(file);
		worker.onmessage = onMessage;
		worker.onerror = onError;
		return worker;
	} catch (e) {
		onError(e);
	}
}
export function loadProcessors() {}

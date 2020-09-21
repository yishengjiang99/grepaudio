import { globalObject } from "./types";

export const trap_signal = (signal) =>
	new Promise((resolve) => {
		self.addEventListener("message", (e) => {
			if (e.data.signal && e.data.signal === signal) {
				resolve();
				e.preventDefault();
			}
		});
	});
export const trap_resp_key = (key) => {
	new Promise((resolve) => {
		globalObject.addEventListener("message", (e) => {
			if (e.data[key]) {
				e.preventDefault();
				resolve();
			}
		});
	});
};
export const signal_listen_non_block = (sctx) => {
	sctx.addEventListener("message", (event) => {
		if (event.signal) {
			sctx.signal = event.signal;
		}
	});
};

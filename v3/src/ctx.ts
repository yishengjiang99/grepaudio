import { assert } from "chai";
import { loadInlineWorklet } from "./offline-ctx";
import { Milliseconds, CallBack } from "./types";
let ctx;

export const getCtx = (): AudioContext => {
	if (!window) {
		return null;
	}
	if (ctx && ctx.state === "running") {
		return ctx;
	}
	try {
		ctx = new AudioContext();
	} catch (e) {
		window.addEventListener(
			"mousemove",
			() => {
				ctx.resume();
			},
			{ once: true }
		);
	}
	return ctx;
};

export function ensureDiv(selector) {
	let div = document.querySelector(selector);
	if (!div) {
		const div = document.createElement(selector.split("#")[0]);
		div.id = selector.split("#")[1];
		document.body.appendChild(div);
	}
	return div;
}
export function createDiv(tag) {
	const div = document.createElement(tag);
	document.body.appendChild(div);
	return div;
}

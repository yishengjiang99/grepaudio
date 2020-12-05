globalThis.ctx = new AudioContext();

export const getCtx = (): AudioContext => {
	return globalThis.ctx;
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

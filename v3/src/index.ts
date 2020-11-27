export * from "./ctx";
export * from "./outputBuffer";
export * from "./timeseries";
export * from "./types";
export * from "./sounds";
export * from "./osc3";
import { createElement as h } from "react";
import { render } from "react-dom";
import { getCtx } from "./ctx";
import { osc3, osc3run, scale } from "./osc3";
import { midiToFreq } from "./types";
import { playMidi } from "./mixer";
import { App } from "./app";
const NoteBtn = ({ midi, fn }) => {
	return h(
		"button",
		{
			onClick: () => getCtx() && fn(),
		},
		[midi + ""]
	);
};
export const gg = () => {
	if (!window) {
		return null;
	}
	const midis = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((i) => i + 24);
	const row1 = h(
		"div",
		{},
		midis.map((midi) => NoteBtn({ midi, fn: () => osc3run(midiToFreq(midi), 0, 0.25) }))
	);
	const row2 = h(
		"div",
		{},
		midis.map((midi) => NoteBtn({ midi, fn: () => scale(midiToFreq(midi)) }))
	);
	return h("div", {}, [
		h("button", { onClick: () => playMidi("midi.csv"), style: { width: 100, height: 100 } }),
		row1,
		row2,
	]);
};
const app = h(App, { msg1: "1", msg2: "2" }, [gg()]);

render(app, document.querySelector("#output"));

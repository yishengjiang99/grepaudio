export * from "./ctx";
export * from "./outputBuffer";
export * from "./timeseries";
export * from "./types";
export * from "./upload-worker";
export * from "./sounds";
export * from "./osc3";
import { createElement as h } from "react";
import { render } from "react-dom";
import { getCtx } from "./ctx";
import { compose, osc3run, scale } from "./osc3";
import { midiToFreq } from "./types";
/* eslint no-multiple-empty-lines: ["off", { "max": 22, "maxEOF": 22 }] */
const NoteBtn = ({ midi = 0, fn, text = "" }) => {
    return h("button", {
        onClick: () => getCtx() && fn(),
    }, [text || midi + ""]);
};
export const App = () => {
    if (!window) {
        return null;
    }
    const midis = [...Array(12).keys()].map((i) => i + 24);
    const row1 = h("div", {}, midis.map((midi) => NoteBtn({ midi, fn: () => osc3run(midiToFreq(midi), 0, 0.25) })));
    const row2 = h("div", {}, midis.map((midi) => NoteBtn({ midi, fn: () => scale(midiToFreq(midi)) })));
    return h("div", {}, [row1, row2]);
};

window.onclick = (e) => {
    render(App(), document.querySelector("#root"));

    compose("abdc");
};
// # sourceMappingURL=index.js.map

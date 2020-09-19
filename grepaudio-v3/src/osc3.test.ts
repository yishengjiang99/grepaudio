/* eslint-disable @typescript-eslint/indent */
import { compose, NodeLength, osc3, osc3run, scale, sequence } from "./osc3";
import { gc, getCtx } from "./ctx";
import { expect } from "chai";
import { outputBuffer } from "./outputBuffer";
import { timeseries } from "./timeseries";
describe("osc3 is a poly synth", () => {
	it("takes a base frequency", async () => {
		const { postAmp, controller } = osc3(440, {
			adsr: [0.0001, 0.0001, 0, 0],
		});
		expect(controller.triggerAttack).to.exist;
		const { proc, samplesGot } = outputBuffer(postAmp, {
			length: 10,
		});
		controller.triggerAttack();
		const sampleArr = await samplesGot();
		const div = document.createElement("div");
		div.id = "viz";
		document.body.appendChild(div);
		timeseries(sampleArr, div);
	});
	it("compose", () => {
		compose("adgadgaegaeg", 133);
	});
	// it("plays the scale maybe", () => {
	// 	scale(24);
	// });
});

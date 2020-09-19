/* eslint-disable @typescript-eslint/indent */
import { osc3run, osc3, sequence, NodeLength, scale } from "./osc3";
import { getCtx } from "./ctx";
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
	it("plays sequence", () => {
		sequence([
			{
				freq: 440,
				length: NodeLength.n8,
				start: 1,
			},
			{
				freq: 255,
				length: NodeLength.n8,
				start: 0.2,
			},
			{
				freq: 444,
				length: NodeLength.n8,
				start: 0.25,
			},
			{
				freq: 333,
				length: NodeLength.n8,
				start: 0.33,
			},
			{
				freq: 255,
				length: NodeLength.n8,
			},
		]);
	});

	it("plays the scale maybe", () => {
		scale(24);
	});
});

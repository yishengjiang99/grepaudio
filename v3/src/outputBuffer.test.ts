/* eslint-disable no-console */
import { outputBuffer } from "./outputBuffer";
import { osc3 } from "./osc3";
import { getCtx } from "./ctx";
import { expect } from "chai";

describe("getOutputBuffer", () => {
	it("it is an script processor", async () => {
		const { postAmp, controller } = osc3(322);
		postAmp.connect(postAmp.context.destination);
		const output = new Float32Array(getCtx().sampleRate);
		const { proc, samplesGot } = outputBuffer(postAmp, {
			outlet: postAmp.context.destination,
			length: 100,
			output,
		});
		controller.triggerAttack();
		setTimeout(() => controller.triggerRelease(), 100);
		expect(proc).to.exist;
		try {
			await samplesGot();
			expect(output[33]).to.not.equal(0);
			expect(output[44]).to.be.greaterThan(output[3]);
		} catch (e) {
			alert(e.message);
			console.log(e);
			expect(e).to.be.null;
		}
	});
});

describe("probe", () => {
	it("loads worklet", () => {});
});

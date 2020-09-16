import { outputBuffer } from "./outputBuffer";
import { osc3 } from "./osc3";
import { getCtx } from "./ctx";
import { expect } from "chai";
import { asyncVerify } from "run-async";
describe("getOutputBuffer", () => {
    it("it is an script processor", () => {
        const osc = osc3(322);
        const output = new Float32Array(getCtx().sampleRate);
        const { node, samples } = outputBuffer(osc, {
            outlet: osc.context.destination,
            length: 1000,
            output,
        });
        asyncVerify(() => {
            samples();
        }, () => {
            expect(output[3]).to.not.equal(0);
            expect(output[4]).to.be.greaterThan(output[4]);
        });
        expect(typeof node).to.equal(ScriptProcessorNode);
    });
});
//# sourceMappingURL=outputBuffer.test.js.map
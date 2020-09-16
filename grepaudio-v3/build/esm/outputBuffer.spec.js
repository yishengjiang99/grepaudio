import { __awaiter } from "tslib";
import { getOutputBuffer } from "../../src/outputBuffer";
import { osc3 } from "../../src/osc3";
import { timeseries } from "../../src/timeseries";
export const test = () => __awaiter(void 0, void 0, void 0, function* () {
    let i = 0;
    let osc = osc3(333);
    let sample = yield getOutputBuffer(osc, 500);
    timeseries(sample, "console");
    //document.querySelector("#console").innerHTML = sample.join("\n");
});
//# sourceMappingURL=outputBuffer.spec.js.map
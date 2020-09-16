import { osc3run } from "./osc3";
import { getCtx } from "./ctx";
describe("play sound", () => {
    it("ss", () => {
        let i = 0;
        osc3run(440, i + 0, 0.3).connect(getCtx().destination);
        osc3run(220, i + 0.5, 0.4).connect(getCtx().destination);
        osc3run(440, i + 1).connect(getCtx().destination);
    });
});
//# sourceMappingURL=osc3.test.js.map
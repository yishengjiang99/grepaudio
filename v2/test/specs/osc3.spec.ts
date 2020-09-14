import { osc3run } from "../../src/osc3";
import { getCtx } from "../../src/ctx";
export const test = async () => {
  let i = 0;
  osc3run(440, i + 0, 0.3).connect(getCtx().destination);
  osc3run(220, i + 0.5, 0.4).connect(getCtx().destination);
  osc3run(440, i + 1).connect(getCtx().destination);
  // i += 1.5;
  // osc3run(440, i + 0, 0.3);
  // osc3run(220, i + 0.5, 0.4);
  // osc3run(440, i + 1);
  // i += 1.5;
  // osc3run(440, i + 0, 0.3);
  // osc3run(220, i + 0.5, 0.4);
  // osc3run(440, i + 1);
};

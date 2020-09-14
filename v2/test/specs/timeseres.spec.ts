import { getOutputBuffer } from "../../src/outputBuffer";
import { timeseries } from "../../src/timeseries";
import { getCtx } from "../../src/ctx";
export const test = async () => {
  let i = 0;
  const ctx = getCtx();
  const osc = new OscillatorNode(ctx, { type: "sine", frequency: 22 });
  osc.start();
  let sample = await getOutputBuffer(osc, 1500);
  osc.stop(3);

  timeseries(sample, "console");
  //document.querySelector("#console").innerHTML = sample.join("\n");
};

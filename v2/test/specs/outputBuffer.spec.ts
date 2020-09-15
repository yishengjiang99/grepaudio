import { getOutputBuffer } from "../../src/outputBuffer";
import { osc3 } from "../../src/osc3";
import { timeseries } from "../../src/timeseries";

export const test = async () => {
  let i = 0;
  let osc = osc3(333);

  let sample = await getOutputBuffer(osc, 500);
  timeseries(sample, "console");
  //document.querySelector("#console").innerHTML = sample.join("\n");
};

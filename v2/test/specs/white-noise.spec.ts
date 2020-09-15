import { getOutputBuffer } from "../../src/outputBuffer";
import { timeseries } from "../../src/timeseries";
import { getCtx } from "../../src/ctx";
import { whiteNoise } from "../../src/white-noise";

export const test = async () => {
  let i = 0;
  let node = whiteNoise({ adsr: [0.01, 0.1, 0.0, 0.0] });
  // let sample = await getOutputBuffer(node, 1500);
  node.connect(node.context.destination);
  await new Promise((resolve) => setTimeout(resolve, 300));
  node = whiteNoise({ adsr: [0.01, 0.1, 0.0, 0.0] });
  // let sample = await getOutputBuffer(node, 1500);
  node.connect(node.context.destination);
  await new Promise((resolve) => setTimeout(resolve, 300));

  node = whiteNoise({ adsr: [0.01, 0.1, 0.0, 0.0] });
  // let sample = await getOutputBuffer(node, 1500);
  node.connect(node.context.destination);
  await new Promise((resolve) => setTimeout(resolve, 300));

  node = whiteNoise({ adsr: [0.01, 0.1, 0.0, 0.0] });
  // let sample = await getOutputBuffer(node, 1500);
  node
    .connect(new GainNode(getCtx(), { gain: 5 }))
    .connect(node.context.destination);

  //timeseries(sample, "console");
  //document.querySelector("#console").innerHTML = sample.join("\n");
};

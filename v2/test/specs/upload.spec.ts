import { init } from "../../src/processors/index";
import { whiteNoise } from "../../src/white-noise";
import { getCtx } from "../../src/ctx";

export const test = async () => {
  const { uploadProcessor } = await init(getCtx());

  const node = whiteNoise({ adsr: [0.01, 0.1, 0.0, 0.0] });
  node.connect(uploadProcessor).connect(getCtx().destination);
};

// require("../loadTest").loadTest("./upload.spec.ts");

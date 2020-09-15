import { getOutputBuffer } from "./getOutputBuffer";
export const test = async () => {
  const ctx = new AudioContext();
  ctx.createOscillator();
  const osc = new OscillatorNode(ctx, {
    frequency: 440,
    type: "sine",
  });
  osc.start();
  const samples = await getOutputBuffer(osc, 100);
  osc.stop(2);
  globalThis.output(samples.join(","));
};

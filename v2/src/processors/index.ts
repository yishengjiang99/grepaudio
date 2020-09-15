export async function init(ctx: AudioContext) {
  try {
    await ctx.audioWorklet.addModule("upload-processor");
    const uploadProcessor = new AudioWorkletNode(ctx, "upload-processor");
    await new Promise((resolve, reject) => {
      uploadProcessor.port.onmessage = ({ data }) => {
        if (data === "initialized") {
          resolve(1);
        }
        setTimeout(reject, 2000);
      };
    });
    await ctx.audioWorklet.addModule("eq-processor");
    const eqProcessor = new AudioWorkletNode(ctx, "eq-processor");
    return {
      uploadProcessor,
      eqProcessor,
    };
  } catch (e) {
    alert(e.message);
  }
}

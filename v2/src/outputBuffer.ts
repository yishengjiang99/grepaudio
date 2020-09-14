export const getOutputBuffer = async (
  node: AudioNode,
  ms: number,
  percent?: number
): Promise<Float32Array> => {
  const samples = new Float32Array((ms * node.context.sampleRate) / 1000);
  let ptr = 0;
  const proc = node.context.createScriptProcessor(2 << 9, 2, 2);
  node.connect(proc);
  proc.connect(node.context.destination);
  // splitter.connect(node.context.destination, 0);
  return await new Promise((resolve) => {
    proc.onaudioprocess = (e: AudioProcessingEvent) => {
      for (
        let channel = 0;
        channel < e.inputBuffer.numberOfChannels;
        channel++
      ) {
        const inputData = e.inputBuffer.getChannelData(channel);
        for (let i = 0; i < inputData.length; i++) {
          e.outputBuffer[channel] = inputData[i];
          samples[ptr++] = inputData[i];
          if (ptr >= samples.length) {
            resolve(samples);
          }
        }
      }
    };
  });
};

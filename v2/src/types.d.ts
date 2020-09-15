export type Frequency = number;

export type Filter = {
  frequency: Frequency;
  q: number;
};

export type ADSR = number[];
export type Percent = number; //TODO: put conditional guards here when I figure out how to do them
export interface AudioWorkletProcessor {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[],
    outputs: Float32Array[],
    parameters: Record<string, Float32Array>
  ): boolean;
}

export declare var AudioWorkletProcessor: {
  prototype: AudioWorkletProcessor;
  new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

export declare function registerProcessor(
  name: string,
  processorCtor: (new (
    options?: AudioWorkletNodeOptions
  ) => AudioWorkletProcessor) & {
    parameterDescriptors?: AudioParamDescriptor[];
  }
);

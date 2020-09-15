import { AudioWorkletProcessor, registerProcessor } from "../types";

class EQ extends AudioWorkletProcessor {
  process(inputs: Float32Array[], outputs: Float32Array[], parameters: any) {
    return true;
  }
}

registerProcessor("eq-processor", EQ);

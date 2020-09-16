import { AudioWorkletProcessor, registerProcessor } from "../types";
class EQ extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        return true;
    }
}
registerProcessor("eq-processor", EQ);
//# sourceMappingURL=equalizer.js.map
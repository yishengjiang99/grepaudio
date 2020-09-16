import { __awaiter } from "tslib";
export function init(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield ctx.audioWorklet.addModule("upload-processor");
            const uploadProcessor = new AudioWorkletNode(ctx, "upload-processor");
            yield new Promise((resolve, reject) => {
                uploadProcessor.port.onmessage = ({ data }) => {
                    if (data === "initialized") {
                        resolve(1);
                    }
                    setTimeout(reject, 2000);
                };
            });
            yield ctx.audioWorklet.addModule("eq-processor");
            const eqProcessor = new AudioWorkletNode(ctx, "eq-processor");
            return {
                uploadProcessor,
                eqProcessor,
            };
        }
        catch (e) {
            alert(e.message);
        }
    });
}
//# sourceMappingURL=index.js.map
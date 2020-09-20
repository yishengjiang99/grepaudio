import { __awaiter } from "tslib";
export const midiToFreq = (midi) => {
    return Math.pow(2, (midi - 69) / 12) * 440;
};
export const sleep = function (ms) {
    return __awaiter(this, void 0, void 0, function* () {
        new Promise((resolve) => setTimeout(resolve, ms));
    });
};
export function eventEmitter() {
    const listeners = {};
    return {
        on(key, fn) {
            listeners[key] = (listeners[key] || []).concat(fn);
        },
        off(key, fn) {
            listeners[key] = (listeners[key] || []).filter((f) => f !== fn);
        },
        emit(key, data) {
            (listeners[key] || []).forEach((fn) => {
                fn(data);
            });
        },
    };
}
//# sourceMappingURL=types.js.map
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
// https://github.com/Microsoft/TypeScript/issues/20595#issuecomment-351030256
export const globalObject = (function () {
    if (typeof window !== "undefined") {
        // window is defined in browsers
        return window;
    }
    else if (typeof self !== "undefined") {
        // self is defined in WebWorkers
        return self;
    }
})();
//# sourceMappingURL=types.js.map
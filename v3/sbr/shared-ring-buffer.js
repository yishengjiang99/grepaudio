"use strict";
exports.__esModule = true;
exports.SharedRingBuffer = exports.timeSection = exports.metaSection = void 0;
/*
#define SIXTEEN_PAGES 16 * 4096
typedef struct
{
    uint16_t rPtr;
    uint16_t wPtr;
    uint32_t lastUpdate;
    uint32_t data[SIXTEEN_PAGES];
} SharedRingBuffer;
*/
exports.metaSection = Uint16Array.BYTES_PER_ELEMENT * 2;
exports.timeSection = Int32Array.BYTES_PER_ELEMENT * 1;
var SharedRingBuffer = /** @class */ (function () {
    function SharedRingBuffer(sharedBuffer) {
        this.stateBuffer = new Uint16Array(sharedBuffer, 0, 2);
        this._lastUpdate = new Int32Array(sharedBuffer, exports.metaSection, 1);
        this.dataBuffer = new Float32Array(sharedBuffer, exports.metaSection + exports.timeSection);
        this.bufferSize = sharedBuffer.byteLength - exports.metaSection - exports.timeSection;
    }
    SharedRingBuffer.prototype.writeBinurally = function (left, right) {
        var wptr = this.wPtr;
        for (var i = 0; left[i] || right[i]; i++) {
            if (wptr) {
                this.dataBuffer[wptr++ % this.bufferSize] = left[i];
                this.dataBuffer[wptr++ % this.bufferSize] = right[i];
            }
        }
        this.wPtr = wptr;
    };
    SharedRingBuffer.prototype.write = function (ab) {
        var wptr = this.wPtr;
        for (var i = 0; i < ab.length; i++) {
            this.dataBuffer[wptr++ % this.bufferSize] = ab[i];
        }
        this.wPtr = wptr;
    };
    SharedRingBuffer.prototype.readToUint16Array = function (output) {
        var ptr = this.readPtr;
        for (var i = 0; i < output.length && ptr <= this.wPtr; i++) {
            var d = this.dataBuffer[ptr++ % this.bufferSize];
            output[i] = d < 0 ? 0x8000 & d : 0x7ffff & d;
        }
        this.readPtr = ptr;
        return output;
    };
    SharedRingBuffer.prototype.read = function (n, output) {
        var ptr = this.readPtr;
        output = output || new Float32Array(n);
        for (var i = 0; i < n && ptr <= this.wPtr; i++) {
            output[i] = this.dataBuffer[ptr++ % this.bufferSize];
        }
        this.readPtr = ptr;
        return output;
    };
    SharedRingBuffer.prototype.readToBuffer = function (outputBuffer) {
        return this.read(Math.min(this.wPtr - this.readPtr), outputBuffer);
    };
    Object.defineProperty(SharedRingBuffer.prototype, "buffer", {
        get: function () {
            return this.dataBuffer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SharedRingBuffer.prototype, "wPtr", {
        get: function () {
            return Atomics.load(this.stateBuffer, 0);
        },
        set: function (value) {
            this.logUpdate();
            Atomics.store(this.stateBuffer, 0, value % this.bufferSize);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SharedRingBuffer.prototype, "readPtr", {
        get: function () {
            return Atomics.load(this.stateBuffer, 1);
        },
        set: function (value) {
            Atomics.store(this.stateBuffer, 1, value % this.bufferSize);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SharedRingBuffer.prototype, "lastUpdate", {
        get: function () {
            return Atomics.load(this._lastUpdate, 0) + 1600235779107;
        },
        enumerable: false,
        configurable: true
    });
    SharedRingBuffer.prototype.logUpdate = function () {
        var now = new Date().getTime() - 1600235779107;
        Atomics.store(this._lastUpdate, 0, now);
    };
    return SharedRingBuffer;
}());
exports.SharedRingBuffer = SharedRingBuffer;
if (globalThis) {
    globalThis.SharedRingBuffer = SharedRingBuffer;
}

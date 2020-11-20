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
export const metaSection = Uint16Array.BYTES_PER_ELEMENT * 2;
export const timeSection = Int32Array.BYTES_PER_ELEMENT * 1;
export class SharedRingBuffer {
    constructor(sharedBuffer) {
        this.stateBuffer = new Uint16Array(sharedBuffer, 0, 2);
        this._lastUpdate = new Int32Array(sharedBuffer, metaSection, 1);
        this.dataBuffer = new Float32Array(sharedBuffer, metaSection + timeSection);
        this.bufferSize = sharedBuffer.byteLength - metaSection - timeSection;
    }
    writeBinurally(left, right) {
        let wptr = this.wPtr;
        for (let i = 0; left[i] || right[i]; i++) {
            if (wptr) {
                this.dataBuffer[wptr++ % this.bufferSize] = left[i];
                this.dataBuffer[wptr++ % this.bufferSize] = right[i];
            }
        }
        this.wPtr = wptr;
    }
    write(ab) {
        let wptr = this.wPtr;
        for (let i = 0; i < ab.length; i++) {
            this.dataBuffer[wptr++ % this.bufferSize] = ab[i];
        }
        this.wPtr = wptr;
    }
    readToUint16Array(output) {
        let ptr = this.readPtr;
        for (let i = 0; i < output.length && ptr <= this.wPtr; i++) {
            const d = this.dataBuffer[ptr++ % this.bufferSize];
            output[i] = d < 0 ? 0x8000 & d : 0x7ffff & d;
        }
        this.readPtr = ptr;
        return output;
    }
    read(n, output) {
        let ptr = this.readPtr;
        output = output || new Float32Array(n);
        for (let i = 0; i < n && ptr <= this.wPtr; i++) {
            output[i] = this.dataBuffer[ptr++ % this.bufferSize];
        }
        this.readPtr = ptr;
        return output;
    }
    readToBuffer(outputBuffer) {
        return this.read(Math.min(this.wPtr - this.readPtr), outputBuffer);
    }
    get buffer() {
        return this.dataBuffer;
    }
    get wPtr() {
        return Atomics.load(this.stateBuffer, 0);
    }
    set wPtr(value) {
        this.logUpdate();
        Atomics.store(this.stateBuffer, 0, value % this.bufferSize);
    }
    get readPtr() {
        return Atomics.load(this.stateBuffer, 1);
    }
    set readPtr(value) {
        Atomics.store(this.stateBuffer, 1, value % this.bufferSize);
    }
    get lastUpdate() {
        return Atomics.load(this._lastUpdate, 0) + 1600235779107;
    }
    logUpdate() {
        const now = new Date().getTime() - 1600235779107;
        Atomics.store(this._lastUpdate, 0, now);
    }
}
if (globalThis) {
    globalThis.SharedRingBuffer = SharedRingBuffer;
}
//# sourceMappingURL=shared-ring-buffer.js.map
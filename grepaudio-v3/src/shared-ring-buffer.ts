/*
  typedef struct{
    uint8_t rPtr;
		uint8_t wPtr;
		uint16_t lastUpdate;
    float32_t data[];
  }SharedRingBuffer
*/
export const metaSection = Uint16Array.BYTES_PER_ELEMENT * 2;
export const timeSection = Uint32Array.BYTES_PER_ELEMENT * 1;
export class SharedRingBuffer {
	dataBuffer: Float32Array;
	stateBuffer: Uint16Array;
	_lastUpdate: Uint32Array;
	bufferSize: number;

	constructor(sharedBuffer: SharedArrayBuffer) {
		this.stateBuffer = new Uint16Array(sharedBuffer, 0, 2);
		this._lastUpdate = new Uint32Array(sharedBuffer, metaSection, 1);
		this.dataBuffer = new Float32Array(
			sharedBuffer,
			metaSection + timeSection
		);
		this.bufferSize = sharedBuffer.byteLength - metaSection;
	}

	write(data: Float32Array) {
		let wptr = this.wPtr;
		for (let i = 0; i < data.length; i++) {
			this.dataBuffer[wptr++] = data[i];
		}
		this.wPtr = wptr;
	}

	read(n: number, output?: Float32Array) {
		let ptr = this.readPtr;
		output = output || new Float32Array(n);
		for (let i = 0; i < n && ptr <= this.wPtr; i++) {
			output[i] = this.dataBuffer[ptr++ % this.bufferSize];
		}
		this.readPtr = ptr;
		return output;
	}
	readToBuffer(outputBuffer: Float32Array) {
		return this.read(Math.min(this.wPtr - this.readPtr), outputBuffer);
	}

	get buffer() {
		return this.dataBuffer;
	}

	get wPtr() {
		return Atomics.load(this.stateBuffer, 0);
	}
	set wPtr(value: number) {
		Atomics.store(this.stateBuffer, 0, value % this.bufferSize);
	}
	get readPtr() {
		return Atomics.load(this.stateBuffer, 1);
	}
	set readPtr(value: number) {
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

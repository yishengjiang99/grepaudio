import { expect } from "chai";
import { SharedRingBuffer } from "./shared-ring-buffer";

describe("shared-ring-buffer", () => {
	it("pretends that it runs on an 80kb ram MCU", () => {
		const srb = new SharedRingBuffer(new SharedArrayBuffer(104));
		expect(srb.buffer.byteLength).to.equal(100);
	});
	it("tracks write ptr", () => {
		const srb = new SharedRingBuffer(new SharedArrayBuffer(104));

		srb.write(new Float32Array([222, 33, 3, 3, 222, 333]));
		expect(srb.wPtr).to.equal(6);
		srb.write(new Float32Array([2]));
		const readout = srb.read(3);
		expect(readout instanceof Float32Array);
		expect(Object.values(readout)).to.deep.equal([222, 33, 3]);

		it("tracks read ptr", () => {
			const readout2 = srb.read(10);
			expect(readout2[0]).to.equal(3);
			expect(readout2[2]).to.equal(333);
			expect(readout2[3]).to.be.null;
			expect(srb.readPtr).to.equal(6);
		});
	});
});

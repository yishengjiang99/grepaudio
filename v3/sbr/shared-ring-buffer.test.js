"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var shared_ring_buffer_1 = require("./shared-ring-buffer");
describe("shared-ring-buffer", function () {
    it("pretends that it runs on an 80kb ram MCU", function () {
        var srb = new shared_ring_buffer_1.SharedRingBuffer(new SharedArrayBuffer(104));
        chai_1.expect(srb.buffer.byteLength).to.equal(104 - shared_ring_buffer_1.metaSection - shared_ring_buffer_1.timeSection);
    });
    it("tracks write ptr", function () {
        var srb = new shared_ring_buffer_1.SharedRingBuffer(new SharedArrayBuffer(104));
        srb.write(new Float32Array([222, 33, 3, 3, 222, 333]));
        chai_1.expect(srb.wPtr).to.equal(6);
        srb.write(new Float32Array([2]));
        var readout = srb.read(3);
        chai_1.expect(readout instanceof Float32Array);
        chai_1.expect(Object.values(readout)).to.deep.equal([222, 33, 3]);
        it("tracks read ptr", function () {
            var readout2 = srb.read(10);
            chai_1.expect(readout2[0]).to.equal(3);
            chai_1.expect(readout2[2]).to.equal(333);
            chai_1.expect(readout2[3]).to.be["null"];
            chai_1.expect(srb.readPtr).to.equal(6);
        });
    });
});

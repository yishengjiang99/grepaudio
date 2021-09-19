"use strict";
exports.__esModule = true;
var buffer_reader_1 = require("./buffer-reader");
describe("buffer read", function () {
    it("loads buffer from https", function () {
        buffer_reader_1.bufferReader("https://www.grepawk.com/fs/Vanessa%20Carlton%20-%20A%20Thousand%20Miles%20(Official%20Video)-Cwkej79U3ek.opus");
    });
});

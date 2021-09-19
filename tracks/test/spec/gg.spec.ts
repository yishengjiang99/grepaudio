import * as bufferReader from "../../src/buffer-reader";
import { expect } from "chai";
describe("bufferRead", () => {
  it("reads audio files", () => {
    bufferReader
      .fetchBlob("https://dsp.grepawk.com/samples/song.mp3")
      .then((resp) => {
        expect(resp).to.exist;
      });
  });
});

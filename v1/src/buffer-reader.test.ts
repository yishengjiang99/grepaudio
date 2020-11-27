import { bufferReader } from "./buffer-reader";

describe("buffer read", () => {
  it("loads buffer from https", async (done) => {
    const ret = await bufferReader(
      "https://www.grepawk.com/fs/Vanessa%20Carlton%20-%20A%20Thousand%20Miles%20(Official%20Video)-Cwkej79U3ek.opus"
    );
    console.log(ret);
    done();
  });
});

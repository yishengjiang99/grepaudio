const { ListXForm } = require("../../dist");
const { PassThrough, Transform, Duplex } = require("stream");
const { fstat, createReadStream } = require("fs");
const { resolve } = require("path");
const { expect } = require("chai");

describe("list x form", function () {
  it("sample 1", function () {
    const xform = new ListXForm();
    require("fs")
      .createReadStream(require("path").resolve("test/data/sample1.json"))
      .pipe(xform);
    xform.on("data", function (d) {
      try {
        const result = JSON.parse(d);
        const keys = Object.keys(result);
        ["height", "url", "width"].map((attr) => expect(keys).to.contain(attr));
      } catch (e) {
        console.log("++++++++++++++++" + d.toString());
        console.error(e);
      }
    });
  });

  it("it should pipe to another transformer", () => {
    require("child_process").execSync(
      "lsof -i tcp:8085 |grep -v COMM|awk '{print $2}'|xargs kill -9"
    );
    const pt = new PassThrough();
    const xform = new ListXForm();
    const server = require("http")
      .createServer((req, res) => {
        const rs = require("fs").createReadStream(
          require("path").resolve("test/data/package.json")
        );
        rs.pipe(xform);
        xform.pipe(res);
      })
      .listen(8085);

    require("http").get("http://localhost:8085", (response) => {
      response.on("data", (d) => {
        try {
          console.log(JSON.parse(d));
        } catch (e) {
          console.error("err parsing (\n", d.toString(), "\n)");
          //          console.log(d.toString());
        }
      });
      response.on("end", () => server.close());
    });
  });

  it("it should parse complex json", () => {
    const xf = new ListXForm();
    const jp = new Duplex({});
    createReadStream(resolve("test/data/spotify_playlist.json"), (rs) =>
      rs.pipe(xf)
    );
    xf.on("data", (d) => {
      let json = JSON.parse(d);
      this.emit("json", json);
    });
    xf.on("json", (json) => {
      expect(json).to.exist();
    });
  });
});

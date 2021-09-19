const { ListXForm, JsonToReact } = require("../../dist");
const { createReadStream } = require("fs");
const { resolve } = require("path");
const { expect } = require("chai");
const {
  TrackItem,
  PlayListItem,
  ProfileItem,
  TrackItemProps,
  trackItemFromJson,
} = require("../fixtures/components");

const fileToTransform = function (path) {
  return createReadStream(resolve(path));
};
describe("trackItem", function () {
  describe("it display a track obj", function () {
    const xform = new ListXForm();
    const jsonToReact = new JsonToReact(trackItemFromJson);

    const rs = fileToTransform("test/data/tracks.json");
    rs.pipe(xform)
      .pipe(jsonToReact)
      .on("data", (component) => {
        expect(component).to.exist();
      });
  });
});

import { ParseJson, RenderReact } from "../../src";
import { createReadStream } from "fs";
import { resolve } from "path";
import { PassThrough, Transform, Duplex } from "stream";
import {
  TrackItem,
  PlayListItem,
  TrackItemProps,
  trackItemFromJson,
} from "../fixtures/components";
const React from 'react';
const fileToTransform = function (path) {
  return createReadStream(resolve(path));
};
describe('simple,', function(){
  it('converts files into qa units',()=>{
    new RenderReact()
  })
})
describe("trackItem", function () {
  it("it display a track obj", function () {
    const xform = new ParseJson();
    const jsonToReact = new RenderReact(trackItemFromJson);

    const rs = fileToTransform("test/data/tracks.json");
    rs.pipe(xform)
      .pipe(jsonToReact)
      .on("data", (component) => {
        expect(component).to.exist();
      });
  });
});

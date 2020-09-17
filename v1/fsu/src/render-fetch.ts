import { Transform } from 'stream';

export default class extends Transform {
  regex: string;
  attlist: string[];
  pendingJson: {};
  pendingCount: number;
  reset() {
    this.pendingJson = {};
    this.pendingCount = 0;
  }

  constructor(attlist) {
    super();

    this.attlist = attlist || "name, id, images, external_urls, preview_url, uri".split(", ");
    this.regex = `/(?:\"(${this.attlist.join("|")})\":)(?:\{)(.*)(?:\"\})/g`;
    this.pendingJson = {};

  }
  /*
    "tracks": [
    "album": {
     "album_type": "album",
    */

  _transform(chunks, encoding, cb) {
    const re = `/(?:\"(${this.attlist.join("|")})\":)(?:\{)(.*)(?:\"\})/g`
    const str = chunks.toString();
    var m, r = [];
    while (m = re.match(str)) {
      m.shift();
      r.push(m);
      this.pendingJson[m[0]] = m[1];
    }

    if (this.pendingCount == this.attlist.length) {
      this.emit("data", this.pendingJson);
      this.reset();
    }
    cb();
  }
}


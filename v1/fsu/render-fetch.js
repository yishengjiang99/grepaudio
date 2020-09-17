"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var stream_1 = require("stream");
var default_1 = /** @class */ (function (_super) {
    __extends(default_1, _super);
    function default_1(attlist) {
        var _this = _super.call(this) || this;
        _this.attlist = attlist || "name, id, images, external_urls, preview_url, uri".split(", ");
        _this.regex = "/(?:\"(" + _this.attlist.join("|") + ")\":)(?:{)(.*)(?:\"})/g";
        _this.pendingJson = {};
        return _this;
    }
    default_1.prototype.reset = function () {
        this.pendingJson = {};
        this.pendingCount = 0;
    };
    /*
      "tracks": [
      "album": {
       "album_type": "album",
      */
    default_1.prototype._transform = function (chunks, encoding, cb) {
        var re = "/(?:\"(" + this.attlist.join("|") + ")\":)(?:{)(.*)(?:\"})/g";
        var str = chunks.toString();
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
    };
    return default_1;
}(stream_1.Transform));
exports["default"] = default_1;

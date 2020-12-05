"use strict";
exports.__esModule = true;
exports.stdoutPanel = exports.$ = exports.startBtn = exports.cdiv = void 0;
exports.cdiv = function (tag, attributes, children) {
    if (attributes === void 0) { attributes = {}; }
    if (children === void 0) { children = []; }
    var div = document.createElement(tag);
    Object.keys(attributes).map(function (k) {
        div[k] = attributes[k];
    });
    children.map(function (c) { return div.append(c); });
    return div;
};
exports.startBtn = function (clickStart) {
    var strtbtn = document.createElement("button");
    strtbtn.innerHTML = "start";
    document.body.append(strtbtn);
    strtbtn.onclick = clickStart;
    return strtbtn;
};
exports.$ = document.querySelector;
exports.stdoutPanel = function (parentDiv) {
    parentDiv = parentDiv || document.body;
    parentDiv.append(exports.cdiv("div", {}, [exports.cdiv("pre", { id: "rx1" }, [])]));
    var rx1 = exports.cdiv("pre", { id: "rx1" });
    return {
        stdout: function (str) { return (rx1.innerHTML = str + "\n" + rx1.innerHTML); },
        rx1: rx1
    };
};

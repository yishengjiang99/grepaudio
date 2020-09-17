"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var web_audio_api_1 = require("web-audio-api");
var defaultProps = {
    renderBufferSizeMS: 3000,
    downSampleRatio: 1,
    autoPlay: true,
};
function bufferReader(url, audioContext, props) {
    var _a = __assign(__assign({}, defaultProps), (props || {})), renderBufferSizeMS = _a.renderBufferSizeMS, downSampleRatio = _a.downSampleRatio, autoPlay = _a.autoPlay;
    var ctx = audioContext || new web_audio_api_1.AudioContext();
    var offlineCtx = new web_audio_api_1.OfflineAudioContext(2, (ctx.sampleRate * renderBufferSizeMS) / 1000, ctx.sampleRate * downSampleRatio);
    return fetchBlob(url)
        .then(function (resp) { return decodeResponse(resp, ctx, offlineCtx); })
        .then(function (bs) { return offlineRender(bs, ctx); })
        .then(function (renderedSource) {
        if (autoPlay) {
            renderedSource.start();
        }
        return renderedSource;
    });
}
exports.default = bufferReader;
var fetchBlob = function (url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.onloadstart = function () { return xhr.response && resolve(xhr.response.toArrayBuffer()); };
        xhr.onload = function () { return xhr.response && resolve(xhr.response.toArrayBuffer()); };
        xhr.onerror = reject;
    });
};
var decodeResponse = function (xhrResponse, ctx, offlineCtx) {
    return new Promise(function (resolve, reject) {
        var bufferSource = offlineCtx.createBufferSource();
        ctx.decodeAudioData(xhrResponse, function (buffer) {
            bufferSource.buffer = buffer;
            resolve(bufferSource);
        }, function (err) {
            reject(err);
        });
    });
};
var offlineRender = function (bufferSource, ctx) {
    return new Promise(function (resolve, reject) {
        var offlineContext = bufferSource.context;
        bufferSource.connect(offlineContext.destination);
        offlineContext
            .startRendering()
            .then(function (renderedBuffer) {
            var renderedBufferSource = ctx.createBufferSource();
            renderedBufferSource.buffer = renderedBuffer;
            renderedBufferSource.connect(ctx.destination);
            resolve(renderedBufferSource);
        })
            .catch(function (e) {
            throw new Error("rendering failed " + e.message);
        });
        bufferSource.start(0);
    });
};
module.exports = {
    bufferReader: bufferReader,
    fetchBlob: fetchBlob,
    offlineRender: offlineRender,
    decodeResponse: decodeResponse,
};
//# sourceMappingURL=buffer-reader.js.map
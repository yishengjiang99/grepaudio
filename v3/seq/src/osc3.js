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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.compression = exports.osc3run = exports.osc3 = exports.defaultOsc3Props = void 0;
///<reference path="./types.d.ts" />;
var envelope_1 = require("./envelope");
exports.defaultOsc3Props = {
    adsr: [0.01, 0.2, 0.3, 0.1],
    detune: [0, 15, 100],
    overtoneAttunuate: [1.2, 0.7, 0.5],
    types: ["square", "sine", "sine"],
    when: 0,
    duration: 0.125,
    harmonicity: [0, 0.5, 1]
};
exports.osc3 = function (baseNote, _props) {
    if (_props === void 0) { _props = {}; }
    var ctx = globalThis.ctx;
    var props = __assign(__assign({}, exports.defaultOsc3Props), _props);
    var duration = props.duration, when = props.when, adsr = props.adsr, types = props.types;
    var merger = new ChannelMergerNode(ctx, {
        numberOfInputs: 3
    });
    var oscillators = [baseNote, baseNote * 2, baseNote * 3].map(function (freq, idx) {
        var osc = new OscillatorNode(ctx, {
            frequency: freq,
            type: types[idx] || "sine"
        });
        var gain = new GainNode(ctx, { gain: props.overtoneAttunuate[idx] });
        osc.connect(gain).connect(merger, 0, idx);
        osc.start();
        return osc;
    });
    var gain = new GainNode(ctx, { gain: 0 });
    merger.connect(gain);
    var _a = envelope_1.envelope(gain.gain, _props.adsr, {
        duration: duration,
        maxVolume: 3.5,
        onRelease: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, gain.disconnect()];
        }); }); }
    }), triggerAttackRelease = _a.triggerAttackRelease, triggerAttack = _a.triggerAttack, triggerRelease = _a.triggerRelease;
    function setFrequency(freqs) {
        [0, 1, 2].map(function (i) {
            var f = freqs[i] || freqs[0] * _props.harmonicity[i];
            oscillators[i].frequency.linearRampToValueAtTime(f, ctx.currentTime + 0.001);
        });
    }
    return {
        nodes: oscillators,
        postAmp: gain,
        setFrequency: setFrequency,
        triggerAttackRelease: triggerAttackRelease,
        triggerAttack: triggerAttack,
        triggerRelease: triggerRelease
    };
};
exports.osc3run = function (baseFrequency, when, duration) {
    var _a = exports.osc3(baseFrequency, {
        duration: duration || 0.25
    }), postAmp = _a.postAmp, triggerAttackRelease = _a.triggerAttackRelease;
    triggerAttackRelease();
};
exports.compression = function () {
    var audioCtx = globalThis.ctx; //();
    var compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
    compressor.knee.setValueAtTime(40, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
    return compressor;
};

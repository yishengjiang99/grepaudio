"use strict";
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
exports.frequencyToNote = exports.keynotes = exports.keys = exports.blackKeys = exports.frequencyToMidi = exports.noteToMinorTriad = exports.noteToMajorTriad = exports.idxToFreq = exports.keyboardToFreq = exports.notesOfOctave = exports.melody = exports.chords = exports.notes = exports.notesOfIndex = exports.map_fft_bins_to_octaves = exports.FFTSIZE = exports.SAMPLE_RATE = exports.globalObject = exports.eventEmitter = exports.stdout = exports.$ = exports.startBtn = exports.cdiv = exports.sleep = exports.midiToFreq = void 0;
exports.midiToFreq = function (midi) {
    return Math.pow(2, (midi - 69) / 12) * 440;
};
exports.sleep = function (ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            new Promise(function (resolve) { return setTimeout(resolve, ms); });
            return [2 /*return*/];
        });
    });
};
exports.cdiv = function (tag, attributes, children) {
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
exports.stdout = function (str) {
    if (!document.getElementById("rx1")) {
        document.body.append(exports.cdiv("div", {}, [exports.cdiv("pre", { id: "rx1" }, [])]));
    }
    var rx1 = document.getElementById("rx1");
    rx1.innerHTML = str + "\n" + rx1.innerHTML;
};
function eventEmitter() {
    var listeners = {};
    return {
        on: function (key, fn) {
            listeners[key] = (listeners[key] || []).concat(fn);
        },
        off: function (key, fn) {
            listeners[key] = (listeners[key] || []).filter(function (f) { return f !== fn; });
        },
        emit: function (key, data) {
            (listeners[key] || []).forEach(function (fn) {
                fn(data);
            });
        }
    };
}
exports.eventEmitter = eventEmitter;
// https://github.com/Microsoft/TypeScript/issues/20595#issuecomment-351030256
exports.globalObject = (function () {
    if (typeof window !== "undefined") {
        // window is defined in browsers
        return window;
    }
    else if (typeof self !== "undefined") {
        // self is defined in WebWorkers
        return self;
    }
})();
/* eslint-disable no-magic-numbers*/
/* eslint-disable comma-dangle*/
exports.SAMPLE_RATE = 2 << 16;
exports.FFTSIZE = 2 << 7;
exports.map_fft_bins_to_octaves = function (octave) {
    var note_hz = exports.notesOfOctave(octave);
    var hz_per_fft_bin = exports.SAMPLE_RATE / 2 / exports.FFTSIZE;
    var map = {};
    for (var i = 0; i < exports.FFTSIZE; i++) {
        var minHz = hz_per_fft_bin * i;
        for (var note_index = 0; note_index < note_hz.length; note_index++) {
            if (minHz >= note_hz[note_index]) {
                map[i] = note_index;
                break;
            }
        }
    }
    return map;
};
exports.notesOfIndex = [
    [16.35, 32.7, 65.41, 130.81, 261.63, 523.25, 1046.5, 2093.0],
    [17.32, 34.65, 69.3, 138.59, 277.18, 554.37, 1108.73, 2217.46],
    [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32],
    [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02],
    [20.6, 41.2, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
    [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
    [23.12, 46.25, 92.5, 185.0, 369.99, 739.99, 1479.98, 2959.96],
    [24.5, 49.0, 98.0, 196.0, 392.0, 783.99, 1567.98, 3135.96],
    [25.96, 51.91, 103.83, 207.65, 415.3, 830.61, 1661.22, 3322.44],
    [27.5, 55.0, 110.0, 220.0, 440.0, 880.0, 1760.0, 3520.0],
    [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
    [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07],
];
exports.notes = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392, 415.3, 440, 466.16, 493.88];
exports.chords = {
    C: ["C", "E", "G"],
    Db: ["Db", "F", "Ab"],
    D: ["D", "Gb", "A"],
    Eb: ["Eb", "F", "G"],
    E: ["E", "Ab", "B"],
    F: ["F", "A", "C"],
    Gb: ["Gb", "Bb", "Db"],
    G: ["G", "B", "D"],
    Ab: ["Ab", "E", "B"],
    A: ["A", "D", "Gb"],
    Bb: ["Bb", "Gb", "Db"],
    B: ["B", "Ab", "E"]
};
exports.melody = ["major", "major", "minor", "major"];
exports.notesOfOctave = function (octave) { return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (idx) { return exports.notesOfIndex[idx][octave]; }); };
exports.keyboardToFreq = function (key, octave) {
    var idx = exports.keys.indexOf(key);
    if (idx < 0)
        return false;
    var baseFreq = exports.notesOfIndex[idx][octave];
    return baseFreq;
};
exports.idxToFreq = function (idx, octave) {
    return exports.notesOfIndex[idx][octave];
};
exports.noteToMajorTriad = function (baseFreq) {
    return [baseFreq, baseFreq * 2, baseFreq * 4];
};
exports.noteToMinorTriad = function (baseFreq) {
    var midi = ~~(12 * Math.log2(baseFreq / 440) + 69);
    return [baseFreq, exports.midiToFreq(midi + 3), exports.midiToFreq(midi + 7)];
};
exports.frequencyToMidi = function (f) { return ~~(12 * Math.log2(f / 440) + 69); };
exports.blackKeys = ["w", "e", "t", "y", "u"];
exports.keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
exports.keynotes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
exports.frequencyToNote = function (f) {
    var midi = exports.frequencyToMidi(f);
    var octave = Math.floor(midi / 12);
    return octave + exports.keynotes[midi % 12];
};

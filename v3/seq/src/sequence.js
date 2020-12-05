"use strict";
var __awaiter =
	(this && this.__awaiter) ||
	function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function (resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function (resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator["throw"](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __generator =
	(this && this.__generator) ||
	function (thisArg, body) {
		var _ = {
				label: 0,
				sent: function () {
					if (t[0] & 1) throw t[1];
					return t[1];
				},
				trys: [],
				ops: [],
			},
			f,
			y,
			t,
			g;
		return (
			(g = { next: verb(0), throw: verb(1), return: verb(2) }),
			typeof Symbol === "function" &&
				(g[Symbol.iterator] = function () {
					return this;
				}),
			g
		);
		function verb(n) {
			return function (v) {
				return step([n, v]);
			};
		}
		function step(op) {
			if (f) throw new TypeError("Generator is already executing.");
			while (_)
				try {
					if (
						((f = 1),
						y &&
							(t =
								op[0] & 2
									? y["return"]
									: op[0]
									? y["throw"] || ((t = y["return"]) && t.call(y), 0)
									: y.next) &&
							!(t = t.call(y, op[1])).done)
					)
						return t;
					if (((y = 0), t)) op = [op[0] & 2, t.value];
					switch (op[0]) {
						case 0:
						case 1:
							t = op;
							break;
						case 4:
							_.label++;
							return { value: op[1], done: false };
						case 5:
							_.label++;
							y = op[1];
							op = [0];
							continue;
						case 7:
							op = _.ops.pop();
							_.trys.pop();
							continue;
						default:
							if (
								!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
								(op[0] === 6 || op[0] === 2)
							) {
								_ = 0;
								continue;
							}
							if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
								_.label = op[1];
								break;
							}
							if (op[0] === 6 && _.label < t[1]) {
								_.label = t[1];
								t = op;
								break;
							}
							if (t && _.label < t[2]) {
								_.label = t[2];
								_.ops.push(op);
								break;
							}
							if (t[2]) _.ops.pop();
							_.trys.pop();
							continue;
					}
					op = body.call(thisArg, _);
				} catch (e) {
					op = [6, e];
					y = 0;
				} finally {
					f = t = 0;
				}
			if (op[0] & 5) throw op[1];
			return { value: op[0] ? op[1] : void 0, done: true };
		}
	};
exports.sequence = void 0;
var functions_1 = require("./functions");
var misc_ui_1 = require("./misc-ui");
var osc3_1 = require("./osc3");
exports.sequence = function (parentDiv) {
	var stdout = misc_ui_1.stdoutPanel(parentDiv).stdout;
	var strtbtn = document.createElement("button");
	strtbtn.innerHTML = "start";
	parentDiv.append(strtbtn);
	strtbtn.onclick = startSequence;
	function startSequence() {
		return __awaiter(this, void 0, void 0, function () {
			var ctx, synth, $, keys, oct, env, notes, keyboard, keyToMidi, keydown, csv, lines;
			return __generator(this, function (_a) {
				switch (_a.label) {
					case 0:
						strtbtn.style.display = "none"; //();
						ctx = new AudioContext();
						globalThis.ctx = ctx;
						synth = osc3_1.osc3(200, osc3_1.defaultOsc3Props);
						synth.postAmp.connect(ctx.destination);
						$ = document.querySelector;
						keys = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
						oct = 4;
						"C,E,F,G".split(",").map(function (root) {
							var rootIndex = keys.indexOf(root);
							var majscale = [rootIndex, (rootIndex + 4) % 12, (rootIndex + 7) % 12];
							var notes = majscale.map(function (idx) {
								return functions_1.keyboardToFreq(idx, oct) || 0;
							});
							var btn = document.createElement("button");
							btn.innerHTML = root + " major";
							btn.onclick = function () {
								stdout("triggering " + notes.join(","));
								synth.setFrequency(notes);
								synth.triggerAttackRelease();
							};
							parentDiv.append(btn);
						});
						parentDiv.append;
						env = {
							attack: 0.1,
							decay: 0.2,
							sustain: 1.0,
							release: 0.8,
						};
						notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
						keyboard = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
						keyToMidi = function (key) {
							var index = keyboard.indexOf(key);
							if (index < 0) return null;
							return notes[index] + 4;
						};
						keydown = {};
						window.addEventListener("keydown", function (e) {
							var vel = performance.now() - e.timeStamp;
							var note = functions_1.keyboardToFreq(e.key, oct);
							keydown[e.key] = e.timeStamp;
							if (!note) return;
							synth.setFrequency([note]);
							synth.triggerAttack();
							stdout("keydown " + note + " \tvel: " + vel + "\t\t");
						});
						window.addEventListener("keypress", function (e) {
							stdout("keypress\t\t" + (keydown[e.key] - performance.now()));
						});
						window.addEventListener("keyup", function (e) {
							synth.triggerRelease();
							//stdout("keyup\t\t" + performance.now() + "\t" + e.timeStamp);
						});
						return [4 /*yield*/, fetch("http://localhost/tracks.csv")];
					case 1:
						return [4 /*yield*/, _a.sent().text()];
					case 2:
						csv = _a.sent();
						lines = csv.split("\n");
						return [2 /*return*/];
				}
			});
		});
	}
};
document.body.onload = function () {
	exports.sequence(document.getElementById("sequence"));
};

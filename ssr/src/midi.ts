/* eslint-disable no-console */
import { spawn } from "child_process";
import { openSync } from "fs";
import { readFileSync } from "fs";
import { readMP3 } from "./ffmpeg";

const lines = readFileSync("./p1.csv").toString().split("\n");
const mp3sfiles = {};
const output = openSync("./composed-" + process.hrtime()[0] + ".pcm", "w");
const sampleRate = 44100;
const sampleBits = 16;
const timeToByteOffset = (time) => ~~(time * sampleRate);
const fileb = Buffer.alloc(13453);

function proc() {
	const [_, instrument, midi, start, duration, _2, _3] = lines[0].split(",");
	const i2 = instrument.split(" ")[-1];
	lines.shift();
	const second = parseInt(start.split(".")[0]);
	const ob = readMP3(parseInt(midi), parseFloat(duration), i2);
	const conv = spawn("ffmpeg", `-i pipe:0 -t ${parseFloat(duration)} -ac 1 -ar 44100 -f s16le temp.pcm`.split(" "));

	const stageBuffer = new SharedArrayBuffer(5 * sampleRate * 8);
	const summingView = new Int32Array(stageBuffer).fill(0);
	const flushedSecond = 0;
	conv.stderr.on("data", console.error);
	conv.stdout.on("error", console.error);
	const noteData = [];
	conv.stdout.on("data", (d) => {
		console.log(d);
	});
	const procDown = new Promise((resolve) => {
		conv.stdout.on("end", () => {
			const startOffset = (parseFloat(start) - flushedSecond) * sampleRate;
			const noteUint16 = new Uint16Array(noteData);
			for (let i = 0; i < noteUint16.length; i++) {
				Atomics.add(summingView, startOffset + i, noteUint16[i]);
			}
			resolve();
		});
	});
	conv.stdin.write(ob);

	procDown.then(proc);
}
proc();

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
import { execSync, spawn, spawnSync } from "child_process";
import { resolve } from "dns";
import { createReadStream, createWriteStream, existsSync, readSync, write } from "fs";
import { PassThrough, Readable, Transform, Writable } from "stream";
import { cspawn, getFd, midiToNoteStr, MP3_NOTE_SIZE } from "./types";

export const splitnotes = (instrument = "trumpet") => {
	const keys = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
	execSync(`ls db/${instrument} || mkdir db/${instrument}`);

	for (let i = 0; i < 88; i++) {
		const name = `${keys[i % 12]}_{Math.floor(i / 12)} _ ${i + 21}.mp3`;
		spawnSync(
			"/bin/dd",
			`bs=${MP3_NOTE_SIZE} if=mp3/FatBoy_${instrument}.mp3 skip=${i} count=1 of=db/${instrument}/${name}`.split(
				" "
			)
		);
	}
};
type HERTZ = number;
type Second = number;
type File = string;
function sshx(str: TemplateStringsArray) {
	spawn(str[0], str.slice(1)); // .split(" "));
}
export const polyNote = (freq1, freq2, freq3, duration, output) => {
	const cmd = [
		"ffmpeg",
		`-f lavfi -i "sine=frequency=${freq1}:duration=${duration}" -filter_complex amerge` +
			` -f lavfi -i "sine=frequency=${freq2}:duration=${duration}"` +
			` -f lavfi -i "sine=frequency=${freq3}:duration=${duration}"` +
			` -f ${output}`,
	];
	spawn(cmd[0], cmd[1].split(" "));
};

export const sine = (props: { frequencies: HERTZ[]; duration?: Second; output?: File; format?: string }) => {
	const defaults = {
		duration: 1,
		output: props.frequencies.join("_") + ".mp3",
		format: "mp3",
	};
	const { frequencies, duration, output, format } = { ...defaults, ...props };
	cspawn(
		"ffmpeg",
		`-y ${frequencies
			.map((f) => `-f lavfi -i sine=frequency=${f}:duration=${duration}`)
			.join(" ")} -f ${format} ${output}`
	);
};
sine({ frequencies: [440, 440] });
export class MP3toWAV extends Transform {
	ffmpeg: import("child_process").ChildProcessWithoutNullStreams;

	constructor() {
		super();
		this.ffmpeg = spawn("ffmpeg", "-i pipe:0 -format wav gg.wav ".split(" "));
		this.ffmpeg.on("error", (e) => console.error(e.message));
		this.ffmpeg.stderr.on("data", (d) => console.error(d.toString()));

		//	this.ffmpeg.stdout.on("data", (d) => this.emit("data", d));
	}
	_transform(chunk: Buffer, encoding, _callback: any) {
		this.ffmpeg.stdin.write(chunk);
		console.log(chunk.toString());
		_callback(null, this.ffmpeg.stdout.read());
	}
	_flush() {
		this.emit("data", this.ffmpeg.stdout.read());
		this.ffmpeg.kill();
	}
}
export class MP3ToPCM extends Transform {
	ffmpeg: import("child_process").ChildProcessWithoutNullStreams;

	constructor() {
		super();
		this.ffmpeg = spawn("ffmpeg", "-i pipe:0 -format f32le - ".split(" "));
		this.ffmpeg.on("data", (d) => this.emit("data", d));
	}
	_transform(chunk: Buffer, encoding, _callback: any) {
		this.ffmpeg.stdin.write(chunk);
	}
	_flush() {
		this.emit("data", this.ffmpeg.stdout.read());
		this.ffmpeg.kill();
	}
}
export const mp3Stream = (midi: number, instrument = "cello"): Readable => {
	const midiStartFseek = (midi - 21) * MP3_NOTE_SIZE;
	const key = `mp3/FatBoy_${instrument.replace(" ", "_")}.mp3`;
	return createReadStream(key, { start: midiStartFseek, end: midiStartFseek + MP3_NOTE_SIZE });
};
export const readMP3 = (midi: number, duration = 2.1, instrument = "cello"): Buffer => {
	const midiStartFseek = (midi - 21) * MP3_NOTE_SIZE;
	const fd = getFd(instrument);
	const transp = Buffer.alloc(MP3_NOTE_SIZE);
	readSync(fd, transp, 0, MP3_NOTE_SIZE, midiStartFseek);
	return transp;
};
export type ShowWaveFormOptions = {
	width: number;
	hieght: number;
	mono: boolean;
};

function ShowWaveForm(input, output, options?: ShowWaveFormOptions) {
	const { width, height, mono } = { ...{ width: 640, height: 320, mono: true }, ...options };
	spawn(
		"ffmpeg",
		`-i ${input} -filter_complex \
	"aformat=channel_layouts=${mono ? "mono" : "stereo"},showwavespic=s=${width}x${height}" \
	-frames:v 1 ${output}`.split(" ")
	);
}
// ShowWaveForm("FatBoy_contrabass.mp3", "FatBoy_contrabass.png");

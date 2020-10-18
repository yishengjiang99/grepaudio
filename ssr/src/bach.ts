/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-var-requires */
import { mp3Stream, MP3ToPCM, MP3toWAV, readMP3, splitnotes } from "./ffmpeg";
import { midiToFreq, MP3_NOTE_SIZE, strToMidi } from "./types";
import { createReadStream, createWriteStream, existsSync, readFileSync, ReadStream, readSync, writeSync } from "fs";
import { resolve } from "path";
import * as uuidv1 from "uuidv1";
import { ChildProcess, exec, execSync, spawn } from "child_process";
import { createServer, OutgoingMessage, ServerResponse } from "http";
import { Writable } from "stream";

export const blackKeys = ["w", "e", "t", "y", "u"];
export const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
export const keynotes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export function sequence(list: Array<number>, speed: Array<number>, instrument: string, output: Writable): void {
	list.map((note, i) => {
		output.write(readMP3(note, 1, instrument), (err) => {
			return err;
		});
	});
	output.end();
}
// const csv = `100
// sequence([43, 43, 43, 39, 39, 39, 41, 41, 41], "cello");
// ,Cellos,43,0.14150849999999998,0.128242078125,0.8188976377952756,G2
// 10,Cellos,43,0.28301699999999996,0.128242078125,0.8582677165354331,G2
// 10,Cellos,43,0.42452549999999994,0.12824207812500005,0.889763779527559,G2
// 10,Cellos,39,0.5660339999999999,2.9915978554687497,0.8582677165354331,D#2
// 10,Cellos,41,3.7049834179687497,0.1258672500000002,0.7795275590551181,F2
// 10,Cellos,41,3.84387141796875,0.1258672500000002,0.8740157480314961,F2
// 10,Cellos,41,3.98275941796875,0.12586724999999976,0.905511811023622,F2
// 10,Cellos,38,4.12164741796875,3.120188554687501,0.8582677165354331,D2
// 10,Cellos,60,7.80417741796875,2.1668698125,0.6299212598425197,C4
// 10,Cellos,59,10.02638541796875,2.1668698125,0.47244094488188976,B3`.split();

// function codeline(line) {
// 	const [midi, instrument, start, duration, velocity] = line.toString().split(",");
// 	const filename = `./db/FatBoy_${instrument}_${midi}.mp3`;
// 	execSync("mkfifo tmp_ifoWAV");
// 	const ob = Buffer.alloc(duration * 44100 * 2 * 100); // actually about 55 bytes too large but to be safe..
// 	const chunks = [];
// 	chunks.push(new Float32Array([ob, velocity]));

// 	createReadStream("tmp_ifoWAV")
// 		.on("data", (d) => chunks.push(d))
// 		.on("end", () => {
// 			execSync("unlink tmp_ifoWAV");
// 			callback(null, chunks);
// 		});

// 	spawn("ffmpeg", `-i ${filename} -duration -format WAV ${filename}.WAV`.split(" ")); // `.stderr.pipe(process.stderr);
// }
// const line = csv.split("\n");
// codeline(line).map((line) => {});
const cspawn = (cmd, str) => spawn(cmd, str.split(" "));

const hexdump = (props?: any) => {
	const { n, p2 } = Object.assign(props || {}, { n: 10, p2: process.stdout });
	return spawn("hexdump", { stdio: ["pipe", "pipe"] });
};
export const combinemp3 = async (notes: any[], inst = "acoustic_grand_piano") => {
	const filename = `${inst}_${notes.join("_")}.wav`;
	if (existsSync(filename)) {
		return filename;
	}
	const args =
		notes.map((note: any) => `-i ${getMp3(note, inst)} `).join(" ") +
		` -filter_complex amix=inputs=${notes.length}:duration=longest` +
		` -f wav ${notes.join("_")}.wav`;
	const p = spawn("ffmpeg", args.split(" "));

	await new Promise((r) => p.on("exit", r));
	return `${notes.join("_")}.wav`;
};

const getMp3 = (note: any, instrument = "acoustic_grand_piano") => {
	const filename = resolve(__dirname, `../db/${instrument}/${note}_${strToMidi(note)}.mp3`);
	if (!existsSync(filename)) {
		splitnotes(instrument);
	}
	return filename;
};

const strtonotes = (str: string, octave = 3) => {
	return str.split("").map((s: string) => keynotes[keys.indexOf(s)] + "_" + octave);
};

const crossfade = (output: Writable, ...files) => {
	let i = 0;
	const filter = "-filter_complex acrossfade=ns=100";
	const format = "-f mp3";
	const stream = files.reduce((pipe0, file, idx) => {
		const proc = cspawn("ffmpeg", `-i pipe:0 -i ${files[i++]} ${filter} ${format} -`);
		pipe0.stdout.pipe(proc.stdin);
		return proc;
	}, cspawn("ffmpeg", "-f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -"));
	stream.stdout.pipe(output);
};

require("http")
	.createServer(async (req: { url: string }, res: ServerResponse) => {
		if (req.url === "/") {
			res.end(`
			<html>
				<body>
				<audio autoplay controls src='/bach.wav'></audio>

				</body>
			</html>`);
			return;
		} else if (req.url === "/bach.wav") {
			res.writeHead(200, {
				"Content-Type": "sound/wav",
			});
			const file = "sssss";
			execSync("mkfifo " + uuidv1());
			const ffmpeg = cspawn("ffmpeg", "-i " + file + " -y -re -format wav - ".split(" "));

			sequence([43, 43, 43, 39], [1281, 1281, 1281, 2100], "cello", createWriteStream(file)); // .pipe(ffmpeg.stdin);
			ffmpeg.stdout.pipe(res);
		} else if (req.url === "/bach.mp3") {
			res.writeHead(200, {
				"Content-Type": "sound/mp3",
			});
			sequence(
				[43, 43, 43, 39, 43, 43, 43, 39, 43, 43, 43, 39, 43, 43, 43, 39],
				[1281, 1281, 1281, 2100, 1281, 1281, 1281, 2100, 1281, 1281, 1281, 2100],
				"cello",
				res
			);
			res.end();
			// crossfade(
			// 	res,
			// 	await combinemp3(strtonotes("adg")),
			// 	await combinemp3(strtonotes("aeg")),
			// 	await combinemp3(strtonotes("adg"))
			// );
		} else if (req.url === "/bach.png") {
			// res.writeHead(200, {
			// 	"Content-Type": "image/png",
			// });
			// const ffmpeg = spawn("ffmpeg", "-i pipe:0 -y -re -format f32le - ".split(" "));
			// sequence([43, 43, 43, 39], [1281, 1281, 1281, 2100], "cello", res); //.pipe(res); //.pipe(ffmpeg.stdin);
			// ffmpeg.stdout.pipe(res);
		}
	})
	.listen(3333);

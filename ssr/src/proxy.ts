import { ChildProcess, exec, execSync, spawn } from "child_process";

import { createReadStream, createWriteStream, openSync, ReadStream, write, WriteStream } from "fs";
import { PassThrough, Writable } from "stream";
import { WebSocketServer, wscat } from "./wss";
import { resolve } from "path";
import { cspawn, hrdiff, sleep } from "./types";

const channelCount = 2;
const sampleRate = 44100;
const fps = 340;
const numberPerFrame = (sampleRate / fps) * channelCount;
const bytesPerFrame = numberPerFrame * 4;
export class Air extends Writable {
	public ffmpeg: ChildProcess;
	public pt: PassThrough;
	buffer: Uint8Array;
	start: [number, number];
	currentFrame: number;
	connector: WriteStream;
	dataView: Uint8Array;
	constructor() {
		super();
		this.buffer = Buffer.alloc(sampleRate * 4).fill(0x01);
		this.currentFrame = 0;

		// execSync(`mkfifo ${pipeout}`);
	}
	//-filter_complex "anoisesrc=d=60:c=pink:r=44100:a=0.5"
	run(): void {
		const pipein = `pipein-${process.hrtime().join(",")}.sock`;

		execSync(`mkfifo ${pipein}`);
		this.connector = createWriteStream(pipein);

		this.ffmpeg = spawn("ffmpeg", [
			"-filter_complex",
			"anoisesrc=d=60:c=pink:r=222:a=0.5",
			"-loglevel",
			"trace",
			"-f",
			"WAV",
			"-",
		]);

		this.ffmpeg.stderr.pipe(process.stderr);

		this.pt = new PassThrough();
		this.ffmpeg.stdout.pipe(this.pt);
		this.currentFrame = 0;
		const tick = async () => {
			const now = process.hrtime();
			if (now[1] / 0xffffffff < 1 / fps) {
				const start = 0;
				const end = bytesPerFrame;
				this.connector.write(this.buffer.slice(start, end));
			} else {
				const end = (process.hrtime()[1] / 0xffffffff) * sampleRate * 4;
				const start = Math.max(0, end - bytesPerFrame);
				this.connector.write(this.buffer.slice(start, end));
			}
			const took = process.hrtime();
			const sleepdiff = hrdiff(now, took) / 1000;
			setTimeout(tick, 1 / fps - sleepdiff);
		};
		tick();
	}
	_write(chunk, encoding) {
		const start = (process.hrtime()[1] / 0xffffffff) * sampleRate * 4 * 2;
		const end = Math.min(start + chunk.byteLength);

		for (let i = 0; i < chunk.byteLength; i++) {
			this.buffer[start] ^= chunk[i];
		}
	}

	public get readable(): PassThrough {
		return this.pt;
	}
	get proc() {
		return this.ffmpeg;
	}
}

export function audioProxy() {
	const soundwave = new Air();
	soundwave.run();
	const server = WebSocketServer({
		onHttp: (req, res) => {
			res.writeHead(200, {
				"Content-Type": "sound/mp3",
				"Content-Disposition": "inline",
			});
		},
		onListening: (socket) => {
			soundwave.run();
		},
		onConnection: (socket) => {
			soundwave.readable.on("data", (d) => socket.write(d));
		},
		onData: (socket, data) => {
			console.log(data[5]);
			if (data && data.byteLength > 100) {
				//soundwave.write(data);
			}
			//soundwave.proc.stdin.write(data);
		},
		port: 5150,
	});
	return {
		soundwave,
		server,
	};
}

process.stdin.on("data", (d) => {
	const input = d.toString().trim();
	let soundwave, server, proxy;
	process.stdout.write(input + "\n");
	if (input === "start") {
		proxy = audioProxy();
		soundwave = proxy.soundwave;
		server = proxy.server;
		//process.stdout.write(soundwave.proc.pid + "");
		const hexdump = spawn("hexdump");
		hexdump.stdout.pipe(process.stdout);
		wscat();
	} else {
	}
});

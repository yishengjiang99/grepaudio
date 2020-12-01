///<reference path="types.d.ts" />;

import { procURL } from "./playback-proc";

let node: AudioWorkletNode, worker: Worker, ctx: AudioContext;
const defaultConfig: PlaybackOptions = { sampleRate: 48000, nchannels: 2, bitdepth: 32 };
export const initProcessor = async (config: PlaybackOptions = defaultConfig) => {
	ctx = new AudioContext({
		sampleRate: config.sampleRate || 44100,
		latencyHint: "playback",
	});
	await ctx.audioWorklet.addModule(procURL);
	node = new AudioWorkletNode(ctx, "playback-processor", {
		outputChannelCount: [2],
	});
	node.connect(ctx.destination);
	return node;
};

export const postStream = async (readable: ReadableStream) => {
	if (!node) node = await initProcessor();
	if (!node) throw new Error("unable to start proc");
	node.port.postMessage({ readable });
	if (ctx.state === "suspended") {
		await ctx.resume();
	}
};
export const setup = async (
	config: PlaybackOptions = {
		nchannels: 2,
		sampleRate: 44100,
		bitdepth: 32,
	}
) => {
	node = await initProcessor(config);
	worker = new Worker("./build/playback-worker.js", { type: "module" });
	worker.postMessage({ port: node.port }, [node.port]);
	await new Promise<void>((resolve) => {
		worker.onmessage = async ({ data: { ready } }) => {
			if (ready === 1) {
				await ctx.resume();
				resolve();
			}
		};
	});

	function queue(url: string) {
		worker.postMessage({ url });
	}

	function playNow(url: string) {
		worker.postMessage({ url });
	}

	function next() {
		worker.postMessage({ cmd: "ff" });
	}
	return {
		worker,
		node,
		queue,
		playNow,
		next,
	};
};

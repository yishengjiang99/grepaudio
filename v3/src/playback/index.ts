import { workerURL } from "./playback-worker";
import { procURL } from "./playback-proc";

let node, worker;
export const fetchpcm = async (url: string) => {
	const ctx = new AudioContext({
		sampleRate: 44100,
		latencyHint: "playback",
	});
	await ctx.audioWorklet.addModule(procURL);
	node = new AudioWorkletNode(ctx, "playback-processor", {
		outputChannelCount: [2],
	});
	await ctx.suspend();

	node.connect(ctx.destination);

	worker = new Worker(workerURL);
	worker.postMessage({ port: node.port, url }, [node.port]);
	await new Promise<void>((resolve) => {
		worker.onmessage = async ({ data: { ready } }) => {
			if (ready === 1) {
				await ctx.resume();
				resolve();
			}
		};
	});
};

fetchpcm("http://localhost:2992/notes/61/trumpet.pcm?t=1").then(() => {
	worker.postMessage({ url: `http://localhost:2992/notes/61/trumpet.pcm?t=0.12` });
});

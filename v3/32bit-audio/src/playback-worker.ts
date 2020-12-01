import { fetchLoader } from "./fetch-url.js";

let port2: MessagePort;
let _config: PlaybackOptions = {
	nchannels: 2,
	sampleRate: 44100,
	bitdepth: 32,
};
onmessage = ({ data: { config, port, url, cmd, stats, ready } }: MessageProps) => {
	if (port) {
		port2 = port;
	}
	if (config) {
		_config = config;
	}
	if (url) {
		fetchLoader(_config, port2).queueUrl(url);
	}
	if (stats) {
		//@ts-ignore
		self.postMessage({ stats });
	}
};

// export const workerURL = URL.createObjectURL(
// 	new Blob(
// 		[
// 			`// const { assert } = require("console");

// const frames = 360;
// const chunk = 1024;
// const queue = [];
// onmessage = ({ data: { port, url } }) => {
// 	queue.push(url)
// 	port.onmessage = ({ data }) => postMessage(data);

// 	const { writable, readable } = new TransformStream({});

// 	(async (_) => {
// 		yield (await fetch(queue.shift(), { cache: "no-store" })).body.pipeTo(writable, {
// 						preventClose: !!queue.length,
// 					});
// 	})();
// 	port.postMessage({ readable: readable }, [readable]);
// };
// `,
// 		],
// 		{ type: "application/javascript" }
// 	)
// );

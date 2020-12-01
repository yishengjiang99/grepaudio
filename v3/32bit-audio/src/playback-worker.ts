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

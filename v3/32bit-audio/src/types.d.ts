type keyvalue<T, S> = { T: S };
type MessageProps = {
	data: {
		config?: PlaybackOptions;
		port?: MessagePort;
		url?: string;
		cmd?: string;
		msg?: string;
		stats?: keyvalue<string, number>[];
		ready: 1;
	};
};
type PlaybackOptions = {
	nchannels: number;
	sampleRate: 44100 | 48000;
	bitdepth: 32;
};
type ByteOffset = number;
type Queue = { url: string; start: ByteOffset; end: ByteOffset | "" }[];

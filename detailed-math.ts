export const s16ArrayBufferStereoToFloat32 = (blob: ArrayBuffer) => {
	const Uint8 = new Uint8Array(blob);
	const ab = new AudioBuffer({
		length: Uint8.length / 4,
		numberOfChannels: 2,
		sampleRate: 48000,
	});
	const uint8ToFloat = (int1, int2) => {
		if (int2 & 0x80) {
			return -(0x10000 - ((int2 << 8) | int1)) / 0x8000;
		} else {
			return ((int2 << 8) | int1) / 0x7fff;
		}
	};

	for (let i = 0, j = 0; i < Uint8.length; i += 4) {
		ab.getChannelData(0)[j] = uint8ToFloat(Uint8[i], Uint8[i + 1]);
		ab.getChannelData(1)[j++] = uint8ToFloat(Uint8[i + 2], Uint8[i + 3]);
	}
};

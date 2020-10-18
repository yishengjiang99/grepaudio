export const MP3_NOTE_SIZE = 10089;

export const AU_SIZE = 128;
export const timePerFrame = (1 / 44100) * AU_SIZE;

export const readPCMF32LEMono = (ab: ArrayBuffer) => {
	const floats = [];
	const fl = new Float32Array(ab);
	const abf = [];
	for (let i = 0; i < ab.byteLength; i += 4) {
		if (ab[i] & 0x80) {
			floats.push(((ab[i + 3] | (ab[i + 2] << 8) | (ab[i + 1] << 16) | (ab[i] << 24)) - 1) / 0x80000000);
		} else {
			floats.push((ab[i + 3] | (ab[i + 2] << 8) | (ab[i + 1] << 16) | (ab[i] << 24)) / 0xffffffff);
		}
	}
	return floats;
};

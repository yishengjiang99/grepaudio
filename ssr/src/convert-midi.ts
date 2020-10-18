import { Midi } from "@tonejs/midi";

function sigfig(num, sigdig) {
	const mask = 10 << sigdig;

	return Math.floor(num * mask) / mask;
}
const sleep = async (ms) => await new Promise((resolve) => setTimeout(resolve, ms));

export async function loadMidi(filename) {
	const midi = await new Midi(require("fs").readFileSync("./midis/" + filename));
	return midi.tracks.map((track) =>
		track.notes.map((note) => [
			note.midi,
			sigfig(note.time, 3),
			sigfig(note.duration, 3),
			sigfig(note.velocity, 3),
			track.instrument.name,
		])
	);
}

export async function* midiTrackGenerator(tracks) {
	const start = process.hrtime();

	const hrdiff = (h1, h2) => h2[0] - h1[0] + (h2[1] - h1[1]) * 1e-9;
	while (true) {
		const time = hrdiff(start, process.hrtime());
		let next = null;
		for (const track of tracks) {
			if (track.length === 0) continue;

			if (track[0][0] <= time) {
				yield [time].concat(track[0]);
				track.shift();
				next = 0;
			} else {
				next = null === next ? track[0][0] - time : Math.min(track[0][0] - time, next);
			}
		}
		await sleep(next * 1000);
	}
}

export async function convertMidi(filename) {
	const tracks = await loadMidi(filename);
	const counterIterator = midiTrackGenerator(tracks);
	while (true) {
		const item = await counterIterator.next();
		if (!item) break;
		console.log(item);
	}
}
convertMidi("onlineMid.mid");

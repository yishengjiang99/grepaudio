import { updateMsg } from "./app";
let ctx = new AudioContext();
const cacheStore = {};
type MidiNote = {
	start: number;
	instrument: String;
	note: number;
	duration: number;
};
type LoadedMidi = {
	buffer: AudioBuffer;
	midi: MidiNote;
};
// type MidiNoteWithBuffer = {
// 	buffer: AudioBuffer & MidiNote;
// };
export const tickToTime = (t) => t / 1000;
export const parseMidiCSV = (line): MidiNote => {
	const [instrument, note, _, _2, start, duration] = line.split(",");
	return {
		instrument: instrument.replace(" ", "_").replace(" ", "_").replace(" ", "_"),
		note: parseInt(note) - 21,
		start: tickToTime(parseInt(start)),
		duration: tickToTime(parseInt(duration)),
	};
};

export const playMidi = async (csv) => {
	let t0;
	for await (const _ of (async function* () {
		while (csv.length) {
			const note = parseMidiCSV(csv.shift());
			const url = `db/Fatboy_${note.instrument}/${note.note}.mp3`;
			fetch(url)
				.then((res) => res.arrayBuffer)
				.then((_ab) =>
					ctx.decodeAudioData(cacheStore[url], function (abb) {
						const abs = new AudioBufferSourceNode(ctx, { buffer: abb });
						abs.connect(ctx.destination);
						abs.start(ctx.currentTime - t0);
					})
				)
				.catch((e1) => {});
		}
	})()) {
	}
};

import { Midi, Track, Header } from "@tonejs/midi";
import { Writable } from "stream";
function sigfig(num, sigdig) {
  const mask = 10 << sigdig;

  return Math.floor(num * mask) / mask;
}
const sleep = async (ms) =>
  await new Promise((resolve) => setTimeout(resolve, ms));

export async function loadMidi(filename) {
  const midi = await new Midi(require("fs").readFileSync(filename));
  return {
    header: midi.header,
    tracks: midi.tracks.map((track) => {
      return track.notes.map((note) => [
        note.ticks,
        note.midi,
        note.durationTicks,
        sigfig(note.velocity, 3),
        track.instrument.name
          .replace(" ", "_")
          .replace(" ", "_")
          .replace(" ", "_"),
      ]);
    }),
  };
}

export async function* midiTrackGenerator(tracks, header) {
  let ticks = 0;

  const ppq = header.ppq;
  const tempos = header.tempos;
  let bpm = tempos[0].bpm;
  let resolution = 4;
  let intervals = 60000 / bpm / resolution;

  /*
	const elapsedBeats = (event.ticks - lastEvent.ticks) / this.ppq;
	const elapsedMeasures =
		elapsedBeats /
		lastEvent.timeSignature[0] /
		(lastEvent.timeSignature[1] / 4);

		*/
  while (true) {
    for (const track of tracks) {
      if (track.length === 0) continue;
      while (track[0][0] <= ticks) {
        yield track.shift();
      }
    }
    ticks += ppq / 4;
    if (tempos[0].ticks < ticks) {
      tempos.shift();
      console.log("tempo change*****", tempos[0]);
      bpm = tempos[0].bpm;
      resolution = 4;
      intervals = 60000 / bpm / resolution;
    }
    await sleep(intervals);
  }
}

export async function convertMidi(filename, outout: Writable) {
  const { tracks, header } = await loadMidi(filename);
  const counterIterator = midiTrackGenerator(tracks, header);
  while (true) {
    const item = await counterIterator.next();
    if (!item) break;
    outout.write(item.value.join(",") + "\n");
  }
}
//convertMidi("onlineMid.mid");

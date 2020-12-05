import { keyboardToFreq } from "./functions";
import { stdoutPanel } from "./misc-ui";
import { osc3run, osc3, defaultOsc3Props } from "./osc3";

export const sequence = (parentDiv: HTMLElement) => {
	const { stdout } = stdoutPanel(parentDiv);

	const strtbtn = document.createElement("button");
	strtbtn.innerHTML = "start";
	parentDiv.append(strtbtn);
	strtbtn.onclick = startSequence;
	async function startSequence() {
		strtbtn.style.display = "none"; //();

		const ctx = new AudioContext();
		globalThis.ctx = ctx;
		const synth = osc3(200, defaultOsc3Props);
		synth.postAmp.connect(ctx.destination);
		const $ = document.querySelector;
		const keys = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
		let oct = 4;
		"C,E,F,G".split(",").map((root) => {
			const rootIndex = keys.indexOf(root);
			const majscale = [rootIndex, (rootIndex + 4) % 12, (rootIndex + 7) % 12];
			const notes = majscale.map((idx) => {
				return keyboardToFreq(idx, oct) || 0;
			});
			const btn = document.createElement("button");
			btn.innerHTML = root + " major";
			btn.onclick = () => {
				stdout("triggering " + notes.join(","));
				synth.setFrequency(notes);
				synth.triggerAttackRelease();
			};
			parentDiv.append(btn);
		});
		parentDiv.append;
		const env = {
			attack: 0.1,
			decay: 0.2,
			sustain: 1.0,
			release: 0.8,
		};
		const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
		const keyboard = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];

		const keyToMidi = (key) => {
			const index = keyboard.indexOf(key);
			if (index < 0) return null;
			return notes[index] + 4;
		};
		const keydown = {};
		window.addEventListener("keydown", (e: KeyboardEvent) => {
			const vel = performance.now() - e.timeStamp;
			const note = keyboardToFreq(e.key, oct);
			keydown[e.key] = e.timeStamp;
			if (!note) return;
			synth.setFrequency([note]);
			synth.triggerAttack();
			stdout(`keydown ${note} \tvel: ${vel}\t\t`);
		});
		window.addEventListener("keypress", (e) => {
			stdout("keypress\t\t" + (keydown[e.key] - performance.now()));
		});
		window.addEventListener("keyup", (e: KeyboardEvent) => {
			synth.triggerRelease();
			//stdout("keyup\t\t" + performance.now() + "\t" + e.timeStamp);
		});
		// fetch("http://localhost:2002/midi/song.csv".th)

		const csv = await (await fetch("http://localhost/tracks.csv")).text();
		const lines = csv.split("\n");
	}
};
document.body.onload = () => {
	sequence(document.getElementById("sequence"));
};

const evt = new EventSource("/events.php");
evt.onopen = () => {
	evt.addEventListener("noteon", (data) => {
		console.log(data);
	});
};
evt.onerror = (e) => {
	console.log(e);
};

import * as Tone from "tone";
const h = (tag, attributes, children = []) => {
	const div = document.createElement(tag);
	Object.keys(attributes).map((k) => {
		div[k] = attributes[k];
	});
	children.map((c) => div.append(c));
	return div;
};

export const ui = () => {
	const strtbtn = document.createElement("button");
	strtbtn.innerHTML = "start";
	document.body.append(strtbtn);

	strtbtn.onclick = async () => {
		await Tone.start();
		strtbtn.style.display = "none"; //();
		const $ = document.querySelector;
		const pol = new Tone.PolySynth().toDestination();
		const keys = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
		let oct = 4;
		const rx1 = h("pre", { id: "rx1" }, []);
		const rx1div = h("div", {}, [rx1]);
		const stdout = (str) => (rx1.innerHTML = str + "\n" + rx1.innerHTML);

		"C,E,F,G".split(",").map((root) => {
			const rootIndex = keys.indexOf(root);
			const majscale = [rootIndex, (rootIndex + 4) % 12, (rootIndex + 7) % 12];
			const notes = majscale.map((idx) => {
				return keys[idx] + oct;
			});
			const btn = document.createElement("button");
			btn.innerHTML = root + " major";
			btn.onclick = () => {
				stdout("triggering " + notes.join(","));
				pol.triggerAttackRelease(notes, "8n");
			};
			document.body.append(btn);
		});
		document.body.append(rx1div);

		window.addEventListener("keydown", (e) => {
			stdout("keydown\t\t" + performance.now() + "\t" + e.timeStamp);
		});
		window.addEventListener("keypress", (e) => {
			stdout("keypress\t\t" + performance.now() + "\t" + e.timeStamp);
		});
		window.addEventListener("keyup", (e: KeyboardEvent) => {
			stdout("keyup\t\t" + performance.now() + "\t" + e.timeStamp);
		});
	};

	document.getElementById("menu").innerHTML;
};

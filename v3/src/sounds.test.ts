import { expect } from "chai";
import { loadBase64 } from "./sounds";
import * as MIDI from "../public/db/FatBoy_acoustic_grand_piano";

describe("load loadBase64", () => {
	it("loads base 64 encoded to audio tag", () => {
		expect(MIDI).to.exist;
		expect(MIDI.Soundfont.acoustic_grand_piano["C2"]).to.exist;
		const node = loadBase64(MIDI.Soundfont.acoustic_grand_piano["C2"], "C2");
		loadBase64(MIDI.Soundfont.acoustic_grand_piano["C3"], "C3");
		loadBase64(MIDI.Soundfont.acoustic_grand_piano["D3"], "D3");
	});
});

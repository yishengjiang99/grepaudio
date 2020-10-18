import { spawn } from "child_process";
import { resolve } from "path";
import { sine } from "./ffmpeg";

describe("ffmpeg sine", () => {
	it("plays two signals", () => {
		sine({ frequencies: [440], duration: 1, output: resolve(__dirname, "sine-440-f32le.pcm") });
		sine({ frequencies: [440], duration: 1, format: "mp3", output: resolve(__dirname, "sine-440.mp3") });
	});
});

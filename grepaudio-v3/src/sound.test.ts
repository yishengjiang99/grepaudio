import { whiteNoise } from "./sounds";

describe("sounds: functions that return playabed audio nodes", () => {
	it("whitenoise", () => {
		const source = whiteNoise();
		source.start();
		source.stop(1);
	});
});

/* eslint-disable @typescript-eslint/indent */
import { osc3run } from "./osc3";
import { getCtx } from "./ctx";

describe("play sound", () => {
	it("ss", () => {
		const i = 0;
		osc3run(440, i + 0, 0.3);

		osc3run(220, i + 0.5, 0.4);

		osc3run(440, i + 1);
	});
});

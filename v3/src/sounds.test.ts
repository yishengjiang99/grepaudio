import { expect } from "chai";
import { loadBase64 } from "./sounds";
import { sleep } from "./types";
describe.skip("load loadBase64", () => {
	it("loads base 64 encoded to audio tag", async () => {
		loadBase64("D3");
		await sleep(125);
		loadBase64("D5");
		await sleep(125);
		loadBase64("D1");
	});
});
describe("", () => {
	it("", () => {});
});

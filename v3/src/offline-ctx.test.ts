import { expect } from "chai";
import { cdiv } from "types";
import { getCtx } from "./ctx";
import { loadInlineWorklet } from "./offline-ctx";
import { osc3 } from "./osc3";

describe("loadInlineWorklet", () => {
	let node;
	let ctx = getCtx();
	it("Loads offline worklet", async () => {
		try {
			node = await loadInlineWorklet({
				className: "Upload",
				classDesc: "upload-processor",
				onInit: ` this.port.postMessage({msg:"[processor] int"})`,
				onMessage: `this.port.postMessage({msg:"pong"})`,
			});
			expect(node).to.exist;
			osc3(333).postAmp.connect(node);
		} catch (e) {
			cdiv("div", { id: "debug" }).append(e.messages);
			expect(e).to.not.exist;
		}
	});
	it("responds to messages via port", async () => {
		try {
			const node2 = await loadInlineWorklet({
				className: "Upload",
				classDesc: "upload-processor",
				onInit: ` this.port.postMessage({msg:"[processor] int"})`,
				onMessage: `this.port.postMessage({msg:"pong"})`,
			});
			const responsePromise = new Promise((resolve) => {
				node2.port.onmessage = (gg) => {
					resolve(gg);
				};
			});

			node2.port.postMessage({ data: "ping" });
			const response = await responsePromise;
			expect(response).to.equal("pong");
		} catch (e) {
			expect(e).to.not.exist;
		}
	});
});

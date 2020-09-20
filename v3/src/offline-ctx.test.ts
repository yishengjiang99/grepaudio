import { expect } from "chai";
import { getCtx } from "./ctx";
import { loadInlineWorklet } from "./offline-ctx";
import { osc3 } from "./osc3";

describe("loadInlineWorklet", () => {
	let node;
	it("Loads offline worklet", async () => {
		expect("test").to.equal("test");
		try {
			node = await loadInlineWorklet({
				className: "Upload",
				classDesc: "upload-processor",
				onInit: `() => {
				   this.port.postMessage({msgg:"[processor] int"})
				}`,
				onMessage: `({ cmd, args }) => {
			   
				}`,
				onProc: `(wctx, input) =>  this.wctx.write(input)`,
			});
			expect(node).to.exist;
			osc3(333).postAmp.connect(node);
			node.connect(getCtx().destination);
		} catch (e) {
			expect.fail(e.message);
		}
	});
	it("responds to messages via port", async () => {
		try {
			const responsePromise = new Promise((resolve) => {
				node.port.onmessage = (gg) => {
					resolve(gg);
				};
			});

			node.port.postMessage({ data: "ping" });
			const response = await responsePromise;
			expect(response).to.equal("pong");
		} catch (e) {
			expect.fail(e.message);
		}
	});
});

import { expect } from "chai";
import { loadAsBlob } from "./load-processors";

describe("loadAsBlob", () => {
	it("loads js into offline context", () => {
		loadAsBlob(
			/* javascript */ `
      postMessage("hello");
    `,
			(msgEvent: MessageEvent) => {
				expect(msgEvent.data).to.equal("hello");
			},
			(err) => {
				alert(err.message);
			}
		);
	});
});

import { fetchChain } from "fetch-pcm";

describe("fetch-pcm", () => {
	it("uses fetch", () => {
		fetchChain("http://localhost/tt.php");
	});
});

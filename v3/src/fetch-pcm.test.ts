describe("fetch-pcm", () => {
	it("uses fetch", () => {
		fetchChain("http://localhost:3222/samples/billie-ac2-ar-44100-s16le.pcm");
	});
});

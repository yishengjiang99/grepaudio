import { expect } from "chai";

describe("ReadableStream", () => {
	it("start, pump", () => {
		let timer;
		const rs = new ReadableStream({
			start: (controller: ReadableStreamDefaultController) => {
				controller.enqueue(1);
			},
			pull: (controller) => {},
			cancel: () => {
				clearInterval(timer);
			},
		});

		let data = [];
		const reader = rs.getReader();
		reader.read().then(function process({ done, value }) {
			console.log(value);
			expect(value).to.equal(0);
			data.push(value);
			if (done) return data;
			else return reader.read().then(process);
		});
		expect(data[5]).to.equal(5);
	});
});

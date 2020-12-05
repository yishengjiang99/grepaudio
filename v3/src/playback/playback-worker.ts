export const workerURL = URL.createObjectURL(
	new Blob(
		[
			`// const { assert } = require("console");

const frames = 360;
const chunk = 1024;
const queue = [];
onmessage = ({ data: { port, url } }) => {
	queue.push(url)	
	port.onmessage = ({ data }) => postMessage(data);
	const { writable, readable } = new TransformStream({});

	(async (_) => {
		for await (const _ of (async function* stream() {
			while (queue.length) {
				yield (await fetch(queue.shift(), { cache: "no-store" })).body.pipeTo(writable, {
					preventClose: !!queue.length,
				});
			}
		})());
	})();
	port.postMessage({ readable: readable }, [readable]);
};
`,
		],
		{ type: "application/javascript" }
	)
);

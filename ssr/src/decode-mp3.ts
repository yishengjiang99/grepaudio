#!/usr/local/bin/node

import { Transform } from "stream";
import { resolve } from "path";
import { fchmod, openSync, readFile, readFileSync, readSync, writeFileSync } from "fs";
import { rejects } from "assert";
const Lame = require("node-lame").Lame;

const rh = openSync(process.argv[2], "r");
const buffer = Buffer.alloc(13453);

async function decodeMid(mid) {
	if (mid >= 100) return;
	const idx = mid - 21;
	readSync(rh, buffer, 0, 13453, idx * 13453);
	const decoder = new Lame({
		output: "buffer",
	});
	let buff = Buffer.from(buffer.toString(), "base64");

	decoder.setBuffer(buff);
	await new Promise(async (resolve) => {
		try {
			await decoder.decode();
			const output = decoder.getBuffer();
			console.log(output.byteLength);
			resolve(output);
		} catch (e) {
			console.error(e);
		}
	});
	//	decodeMid(mid++);
}

decodeMid(21);

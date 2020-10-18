import { SharedRingBuffer } from "shared-ring-buffer";
import * as http from "http";
import * as WebSocket from "ws";
import * as fs from "fs";

const ffmpeg = require("child_process").spawn(
	"ffmpeg",
	"-re -stream_loop -1 -i list.txt -flush_packets 0 -f mpegts udp://127.0.0.1:5000?pkt_size=1316".split(" ")
);
const udp = require("dgram");

// creating a client socket
const client = udp.createSocket("udp4");

const buffer = require("buffer");

// buffer msg
const data = Buffer.from("siddheshrane");

client.on("message", (msg, info) => {
	console.log("Data received from server : " + msg.toString());
	console.log("Received %d bytes from %s:%d\n", msg.length, info.address, info.port);
});

// sending msg
client.send(data, 5000, "localhost", (error) => {
	if (error) {
		client.close();
	} else {
		console.log("Data sent !!!");
	}
});

const data1 = Buffer.from("hello");
const data2 = Buffer.from("world");

// sending multiple msg
client.send([data1, data2], 5000, "localhost", (error) => {
	if (error) {
		client.close();
	} else {
		console.log("Data sent !!!");
	}
});
const listeners = [];

ffmpeg.stdout.on("data", (data) => {
	for (let i = 0; i < listeners.length; i++) {
		listeners[i].send(data);
	}
});

const wssListen = new WebSocket.Server({ host: "localhost", port: 5250 });
wssListen.on("connection", (ws: WebSocket) => {
	listeners.push(ws);
	ws.send("welcome");
	ws.on("message", (data) => {
		console.log(data.toString());
	});
});

client.on("message", (msg, info) => {
	listeners[0].write(msg);
	console.log("Data received from server : " + msg.toString());
	console.log("Received %d bytes from %s:%d\n", msg.length, info.address, info.port);
});

const server = http
	.createServer((req, res) => {
		res.writeHead(200, {
			"Content-type": "text/html",
		});
		res.end(`<html><body>
		<script>
		let ctx;
		window.onload=()=>{
			window.onclick=()=>{
			
				if(ctx)return;
			  const ws = new WebSocket("ws://localhost:5250");
			  ws.send('hi');
		  ctx = new AudioContext();
			  var source = ctx.createBufferSource();
			  source.connect(ctx.destination);
			  ws.onmessage = async ({ data }) => {
				try {
				  ctx.decodeAudioData(data, function (processed) {
					source.buffer = processed;
					source.start();

				  });
				} catch (e) {
				  console.error(e);
				}
			  };
			}
		  }
		</script>
		</body></html>`);
	})
	.listen(8080, () => {
		console.log("Listening at: 127.0.0.1 8080");
	});

ffmpeg.on("error", (err) => {
	throw err;
});

ffmpeg.on("close", (code) => {
	console.log("ffmpeg exited with code " + code);
});

ffmpeg.stderr.on("data", (data) => {
	console.log("stderr: " + data);
});

import * as fs from "fs";
import { IncomingMessage } from "http";
import * as https from "https";
const express = require("express");

const app = express();

app.get("/(:channelId?)(/:sessionId?)", function (req, res) {
  res.end(req.params.channelId);
});
const tls = {
  key: fs.readFileSync(process.env.PRIV_KEYFILE),
  cert: fs.readFileSync(process.env.CERT_FILE),
};
const server = https.createServer(tls, app).listen(5655);

https.get("/", (res) => {
  res.pipe(process.stdout);
});

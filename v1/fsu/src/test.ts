import * as fs from "fs";
import { IncomingMessage } from "http";
import * as https from "https";
import { loadavg } from "os";
import { html0, critcss, critjs, html3 } from "./template";
import { resolve } from "path";
import * as fetch from "node-fetch";
import { Transform, TransformCallback } from "stream";

const express = require("express");
const session = require("express-session");

const express = require("express");

const app = express();
app.get("/", (req, res) => {});
const app = express();
let uuid = 0;
const genuuid = function () {
  return uuid++;
};
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    genid: function (req) {
      return genuuid(); // use UUIDs for session IDs
    },
    cookie: { secure: true },
  })
);
const config1 = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
};

app.get("/mock_api", (req, res) => {
  require("fs").createReadStream("../static/track.json").pipe(res);
});
app.get("/", function (req, res) {
  res.write(html0);
  res.write(critcss);
  // res.write(critjs(`
  //   const wshost = 'wss://${req.hostname}/${req.session.genid}';
  //   const sessionId = '${req.session.genid}'
  //   const pc = new RTCPeerConnection(${JSON.stringify(config1)});`
  // ));

  res.write(html3);
  res.write(
    `<script async src='https://unpkg.com/react@16/umd/react.production.min.js />`
  );
  const hostname = "https://" + process.env.HOST + "/mock_api";

  https.get(hostname, (upstream) => {
    console.log("..");

    upstream.on("data", (d) => res.write((d) => toString()));
    upstream.on("done", res.end());
  });
});
app.get("/:channelId", function (req, res) {
  res.end(req.params.channelId);
});
require("http").createServer(app).listen(3333);

// const tls = {
//   hostname: process.env.HOST,
//   key: fs.readFileSync(process.env.PRIV_KEYFILE),
//   cert: fs.readFileSync(process.env.CERT_FILE),
// }

// const server = https.createServer(tls, app)
// server.listen(443);

const test = () => {
  const hostname = "https://" + process.env.HOST;

  https.get(hostname + "/mock_api", (res) => {
    res.pipe(process.stdout);
  });

  https.get(hostname, (res) => {
    const snap = fs.createWriteStream(
      resolve("snaps", new Date().toTimeString() + ".html")
    );
    res.pipe(snap);
  });

  // setTimeout(function () {
  //   require('child_process').execSync("lsof -i tcp:443 |grep -v PID|awk '{print $2}' |xargs kill -9");
  //   process.exit(0);
  // }, 5000);
};

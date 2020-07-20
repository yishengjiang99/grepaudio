const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const httpport = process.env.PORT || 3333;
const axios = require("axios");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const { get } = require("request");
const PassThrough = require("stream").PassThrough;
const {
  RTCAudioSink,
  RTCVideoSink,
  RTCAudioSource,
} = require("wrtc").nonstandard;
const wrtc = require("wrtc");
const { render } = require("react-dom");

app.set("views", __dirname + "/views");
app.set("view engine", "jsx");
app.engine("jsx", require("express-react-views").createEngine());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT");
  res.header("Transfer-Encoding", "chunked");
  next();
});

const api = express.Router();
api.get("/", async (req, res) => {
  try {
    var pc = new wrtc.RTCPeerConnection(peerRTCConfig);
    const { FakeMediaStreamTrack } = require("fake-mediastreamtrack");
    const track = new FakeMediaStreamTrack({ kind: "audio" });
    track.enabled = false;
    app.render("index");
  } catch (e) {}
});

api.get("/lib", (req, res) =>
  exec(
    "ls -l ..",
    (err, stdout) => (err && res.end(err.message)) || res.end(stdout)
  )
);

api.get("/lib/(:file).js", (req, res) => {
  const filename = req.params.file + ".js";
  const fs = require("fs");
  if (fs.existsSync(path.resolve("..", filename))) {
    res.sendFile(path.resolve("..", filename));
  } else {
    res.sendStatus(404);
    res.end();
  }
});

api.get("/rap(:format?)", (req, res) => {
  const format = req.params.format || ".json";
  switch (format) {
    case ".json":
      res.header("Content-Type: appliction/json");
      fs.readFile("../samples/yt.json", "json", (err, output) => {
        (err && res.end(err.message)) || res.end(outout);
      });
      break;
    case ".csv":
      res.header("Content-Type: text/csv");
      res.end("coming soon");
      break;
  }
});

api.get("/eilish", autocorrectHandler);
api.get("/erish", autocorrectHandler);
api.get("/ellish", autocorrectHandler);

function autocorrectHandler(request, res) {
  try {
    request.start = new Date();
    const stream = ytdl(`https://www.youtube.com/watch?v=DyDfgMOUjCI`, {
      quality: "highestaudio",
      filter: "audio",
    }).on("error", console.error);

    const ffm = ffmpeg(stream).addOption("-ss 00:08");

    res.writeHead(200, {
      "Content-Type": "audio/mp3",
    });
    ffm.audioBitrate(320).format("mp3").pipe(new PassThrough()).pipe(res);
  } catch (e) {
    console.log(e);
  }
}

api.get("/yt/(:query).mp3", (req, res) => {
  let stream = ytdl(`https://www.youtube.com/watch?v=${req.params.vid}`);
  let start = Date.now();
  res.writeHead(200, {
    "Content-Type": "audio/mp3",
  });
  ffmpeg(stream)
    .audioFilter("volune=1.5")
    .audioBitrate(320)
    .format("mp3")
    .pipe(new PassThrough())
    .pipe(res);
});
api.use("/spotify", require("./spotify.js"));

api.use(function (req, res) {
  res.end(req.path);
});
app.use("/api", api);

app.listen(httpport);

require("./stream_signal.js");

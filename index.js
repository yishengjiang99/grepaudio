nano const ytdl = require('ytdl-core')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const FFmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream')
const { exec } = require('child_process')

const express = require('express')
const app = express()
const httpport = process.env.PORT || 3333
const https = require('https');

//
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT");
});


app.get("/", function(req,req,next){

  const fs = require('fs');
  exec("ls ../samples/*.mp3", (err, stdout,stderr)=>{
    if(err) res.end(err.message);
    else res.end(stdout);
  });

  next();
});


app.use("/samples", express.static("/samples"));

app.get("/api/twitch/(:uri)", function (req, res, next) {
  https.get("https://api/twitch.tv"+req.params.uri.split("--").join("/"), {
    port: 443,
    method: "GET",
    headers: {
      'Accept': 'application/vnd, twitchtv.v5+json',
      'Client-ID': 'e8e2av260ltgocmm62aw6zkojeems3'
    }
  }, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      res.end(JSON.parse(data));
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
  res.send("hold on")
});

app.get("/api/yt", function (req, res, next) {
  const query = req.params.q;
  const youtube_api_key = process.env.google_key;
  const url = `https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&maxResults=10&q=${req.params.query}&key=${youtube_api_key}`
  const request = require("request");

  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (error) {
      callres.stats = 500;
      res.end(error.messsage);
      return;
    }
    if (body.items) {
      ret = body.items.map(item => {

        return {
          vid: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle
        };
      });

      if (req.params.format !== 'options') {

        res.end(JSON.stringify(ret));
      } else {

        var rr = body.items.map(item => {
          return `<option value='${item.id.videoId}'>${item.snippet.title} - ${item.snippet.channelTitle}</option>`;
        }).join("")
        res.end(rr);
      }
    }

  });
});

async function yt_search(query) {
  var rp = require('request-promise');
  const youtube_api_key = 'AIzaSyBCXMcymaqef8RmYskmdVOJcQA5e06Zvyg';
  const url = `https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&maxResults=1&q=${query}&key=${youtube_api_key}`
  try {
    return await rp({ url: url, json: true });
  } catch (e) {
    return false;
  }
}

app.use("/api/sudo/(:q).mp3", async (req, res, next) => {
  yt_search(req.params.q).then(resp => {
    if (resp.items[0]) {
      const vid = resp.items[0].id.videoId;
      FFmpeg.setFfmpegPath(ffmpegPath);
      const video = ytdl(vid, { audioFormat: 'mp3' });
      const ffmpeg = new FFmpeg(video);
      process.nextTick(() => ffmpeg.format('mp3').pipe(new PassThrough()).pipe(res))
    }
  })
    .catch(e => {
      res.status = 500;
      console.log(e);
      res.end(e.message + " ..");
    })
});

app.use("/api/(:vid).mp3", async (req, res, next) => {
  try {
    vid = req.params.vid;
    FFmpeg.setFfmpegPath(ffmpegPath);
    const video = ytdl(vid, { audioFormat: 'mp3' });

    const ffmpeg = new FFmpeg(video);
    process.nextTick(() => ffmpeg.format('mp3').pipe(new PassThrough()).pipe(res))
  } catch (e) {
    res.status = 500;
    res.end(e.message);
  }
});


app.use(function (req, res) {
  res.end(req.path);
})
app.listen(httpport);

require("./stdin.js");

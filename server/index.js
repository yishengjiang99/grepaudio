const ytdl = require('ytdl-core')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const FFmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream')
const { exec } = require('child_process')

const express = require('express')
const app = express()
const httpport = process.env.PORT || 3333
const https = require('https');
const fetch = require('node-fetch');
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT");
  res.header("Transfer-Encoding","chunked");
  next();
});

app.get("/api/list", function(req,res){
  var list = [
    {
      name:"spotlight",
      list:[
        {type:"youtube", url:"https://www.youtube.com/watch?v=QpgOyWllqmc", display:"Forgot about Dre Instrumental"},
        {type:"chord", display:"I–V–vi–IV progression", notes:"C–G–Am–F"}
      ]
    }
  ]

  res.json(list)

})
app.get("/api", function(req,res,next){
  const fs = require('fs');
  exec("ls -l", {cwd:'../public/samples'}, (err, stdout,stderr)=>{
    if(err) res.end(err.message);
    else{
      res.send("<pre>"+stdout+"</pre>");
    }
  });
});


app.get("/api/yt", function(req,res,next){
  const query = req.params.q;
  const youtube_api_key = process.env.google_key      
  const url = `https://www.googleapis.com/youtube/v3/videoCategories&part=snippet&key=${youtube_api_key}`
  fetch(url).then(resp=>resp.json()).then(json=>{
      console.log(json);
  }).catch(e=>res.end(e.message));
});
app.use("/samples", express.static("/samples"));

app.get("/api/twitch/(:uri)", function (req, res, next) {
	exec('sh ../twitch.sh', (error, stdout, stderr) => {
   if (error) {
 	   console.error(`exec error: ${error}`);
    	return;
  	}
	res.end(stdout);
});
});


app.get("/api/yt", function (req, res, next) {
  const query = req.params.q;
  const youtube_api_key = process.env.google_key
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
    console.log(video);
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

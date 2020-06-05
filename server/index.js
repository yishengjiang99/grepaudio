const ytdl = require('ytdl-core')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const FFmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream')
const { exec } = require('child_process')
const fs = require('fs');
const path = require("path");

const youtubedl = require('youtube-dl')

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

app.get("/lib", (req,res)=>{
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT");

  exec("ls -l *.js", {cwd:'..'}, (err, stdout,stderr)=>{
    if(err) res.end(err.message);
    else{
      res.send("<pre>"+stdout+"</pre>");
    }
  });});

app.get("/lib/(:file).js", (req,res)=>{
        const filename = req.params.file+".js";
        const fs = require('fs');
        if( fs.existsSync(path.resolve("..",filename))){
               res.sendFile(path.resolve("..", filename));
        }
        else{
                res.sendStatus(404);
                res.end();
        }
});
app.use("/api/(:vid).mp3", async (req, res, next) => {
  try {
    const vid = req.params.vid;
    FFmpeg.setFfmpegPath(ffmpegPath);
    const pipe = new PassThrough();
    console.log(vid, 'ssss');
    var audio = youtubedl("https://youtube.com/watch?v="+vid,['-x']).pipe(pipe);
    process.nextTick(() => FFmpeg().addInput(pipe).format('mp3').pipe(new PassThrough()).pipe(res));
    return;
  } catch (e) {
    res.status = 500;
    res.end(e.message);
  }
});
//const rtc_routes = require("./dsp_rtc.js");

// app.use("/api/rtc", rtc_routes);

const spotify_routes = require("./spotify.js");
app.use("/api/spotify", spotify_routes);

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





function parseYt(body){
    return body.items.map(item => {

      return {
        vid: item.id.videoId,
        thumbnail: item.snippet.thumbnails.default.url,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        value: `<li><img src='${item.snippet.thumbnails.default.url}'> ${item.snippet.title}</li>`
      };
    });
}

app.get("/api/yt/:query", function(req,res){
  const youtube_api_key = process.env.google_key
  const url = `https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&maxResults=10&q=${req.params.query}&key=${youtube_api_key}`
  fetch(url).then(resp=>resp.json()).then(json=>{
    if(!json.items){
      res.statusMessage='not found';
      console.log(json);
      res.end();
    }else{
      res.json(parseYt(json));
    }
 

  }).catch(e=>res.end(e.message));
});

app.use("/samples", express.static("/samples"));



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


app.use(function (req, res) {
  res.end(req.path);
})
console.log("listening on httpport "+httpport);
app.listen(httpport);

require("./stream_signal.js");

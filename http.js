const ytdl = require('ytdl-core')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const FFmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream')
const { exec } = require('child_process')

const express = require('express')
const app = express()
const httpport = process.env.PORT || 3333
const https = require('https');

//
app.use(function (req,res,next)
{
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods","GET, POST, OPTIONS, PUT");
  next();
});
app.get("/yt", async (req,res) =>{
  const query = req.params.q;

  const youtube_api_key = process.env.GOOGLE_KEY_OMG;  
  const url =`https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&maxResults=10&q=${query}&key=${youtube_api_key}`
  const request = require("request");

  request({
    url: url,
    json: true
  }, function(error, response, body) {
    if(error){
      callres.stats=500;
      res.end(error.messsage);
      return;
    }
    if(body.items){
      ret =  body.items.map(item=> {
        return { 
          vid: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle
        };
      });


      if(req.params.format==='json')
    {
      res.header("Content-Type:application/json");
      res.end(JSON.stringify(ret));
    }else{
      var rethtml = body.items.map(item=>{
        res.send(`<option value=${item.vid}>${item.title}</option>`);
      })
        res.end();
    }
       
    }
  });
});  

app.use("/(:vid).mp3",async (req,res,next) =>
{
  try {
    vid = req.params
    FFmpeg.setFfmpegPath(ffmpegPath);
    const video = ytdl(vid,{ audioFormat: 'mp3' });

    const ffmpeg = new FFmpeg(video);
    process.nextTick(() => ffmpeg.format('mp3').pipe(new PassThrough()).pipe(res))
  } catch (e) {
    res.status=500;
    res.end(e.message);
  }
});


app.use(express.static("/"))
app.listen(httpport);

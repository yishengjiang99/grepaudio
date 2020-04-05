const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('etc/key.pem'),
  cert: fs.readFileSync('etc/cert.pem')
};

const {exec} = require('child_process')
const mime = require("mime");
const path = require("path");
const PORT = 8000

exec(`lsof -i tcp:${PORT} -t | xargs kill`)


https.createServer(options, function (req, res) {

  var url =new URL(req.url, `http://${req.headers.host}${req.url}`);
  const route = path.basename(url.pathname);

  console.log(route);

  switch(route){
    case "yt":
    case "video":    
      return stream_yt(req, res);
    case "search":
      return search_yt(req,res);
    default:
     
      break;
  }
  if(req.url == "/") req.url = "/index.html"
  fs.readFile(__dirname + req.url,  function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
       res.writeHead(200, { 'Content-Type': mime.getType(req.url) });
       res.end(data);
       return;
      });
      
}).listen(8000);

function serve_file(req,res){
    fs.readFile(__dirname +req.url,  function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
       res.writeHead(200, { 'Content-Type': mime.getType(req.url) });
       res.end(data);
      return;
    })
}

function stream_yt(req,res){
  var url =new URL(req.url, `http://${req.headers.host}${req.url}`);
  var id = url.searchParams.get("id")
  const ytdl = require('ytdl-core')
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  const FFmpeg = require('fluent-ffmpeg');
  const { PassThrough } = require('stream')

  FFmpeg.setFfmpegPath(ffmpegPath);

  const video = ytdl(id, {audioFormat: 'mp3'});

  const ffmpeg = new FFmpeg(video);
  process.nextTick(() => {
    const output = ffmpeg.format('mp3').pipe(new PassThrough()).pipe(res);
    ffmpeg.on('err', err => {
      console.log(err);
    })
    output.on('data', data => {
      console.log("*");
    })
  })
}

async function search_yt(req,res){
  console.log('ty')
  const glib = require("./lib/glib.js")
   var url =new URL(req.url, `http://${req.headers.host}${req.url}`);
   var q = url.searchParams.get("q");
   glib.find_youtube(q, 25).then(result=>glib.parse_youtube_results(result)).then(html=>res.end(html)).catch(e=>{
     res.writeHead(500);
    res.end(e.message)
   })
}

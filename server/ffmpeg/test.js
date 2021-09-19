const fs = require("fs");
const ytdl = require("ytdl-core");

function yt_mp3(req, res, vid) {
  ytdl("hhttps://www.youtube.com/watch?v=DyDfgMOUjCI", {
    filter: (format) => format.container === "mp3",
  })
    .on("error", res.end(error.message))
    .pipe(res)
    .on("finish", res.end());
}

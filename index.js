const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('etc/key.pem'),
  cert: fs.readFileSync('etc/cert.pem')
};

https.createServer(options, function (req, res) {
  res.writeHead(200);
  console.log("reading "+ req.url);
  if(req.url=="/") req.url= "/index.html";
  fs.readFile(__dirname +req.url,  function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(8000);

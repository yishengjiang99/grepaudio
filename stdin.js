
const WebSocket = require('ws')
const port = process.env.fs_port || 8086;
const fs = require('ws');

const wss = new WebSocket.Server({
    port: port
})

wss.on('connection', (ws, request) => {
  let fd;
  ws.send(JSON.stringify({message:"welcome"}));

  ws.onmessage = (msg) => {
    console.log("msg "+JSON.stringify(msg));
  }

  ws.on('event', event=>{
   if(event=='1'){
      fd = fs.createWriteStream("./tmp/"+request.uuid);
   }else{
      fd.close();
      ws.send(fd.uuid)
    }
 })

  ws.on('data', data=>{
    fd.write(data);      
  })

})

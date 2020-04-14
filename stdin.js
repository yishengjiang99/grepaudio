
const WebSocket = require('ws')
const port = process.env.fs_port || 8086;
const fs = require('ws');

const wss = new WebSocket.Server({
    port: port
})

wss.on('connection', (ws, request) => {
  let fd = fs.createWriteStream("./tmp/"+request.uuid);

  ws.send(JSON.stringify({message:"welcome"}));

  ws.onmessage = (msg) => {
    console.log("msg ",msg.data);
   
  }


  ws.on('data', data=>{
    console.log(" DATA");
    fd.write(data);      
  })

})

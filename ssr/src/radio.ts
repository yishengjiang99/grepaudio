import { openSync, readSync } from "fs";
import { send } from "process";
// import { WebSocketServer, wscat, WsSocket } from "./wss";
const wsServer = require("ws").Server;

const g = openSync("./C_3_E_3_G_3.pcm", "r");
const ob = Buffer.alloc(433152);
readSync(g, ob, 0, 433152, 0);
const wss = new wsServer({
  port: 4150,
});
wss.on("connection", (ws) => {
  let i = 0;
  ws.on("message", (msg) => {
    ws.send(ob);
  });
});


const xfs = require("./lib/xfs.js");
const mime = require('mime-types')
const WebSocket = require('ws')
const url = require('url');


const port = process.env.fs_port || 8086;

const wss = new WebSocket.Server({
    port: port
})

wss.on('connection', (ws, request) => {

  ws.on("message", (message)=>{

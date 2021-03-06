var host = host || "wss://www.grepawk.com/signal?sessId=" + (sessionID || "1234");
var msgChannel = new BroadcastChannel("wschannel");
msgChannel.onmessage = ({ data }) => {
  if (typeof data === "string" && socket) socket.send(data);
  if (data.cmd && socket) {
    if (data.cmd === "updateSetting") {
      //   socket.send(JSON.stringify(data));
    }
    if (data.cmd === "compose" && data.adsr) {
      const { type, time, instrument, freq, index, bar, adsr } = data;
      const csvstr = ["compose", bar, freq, index, adsr[0], adsr[1], adsr[2], instrument].join(",");
      socket.send("csv:" + csvstr);
    }
  }
};
const output = (str) => {
  msgChannel.postMessage({ msg: str });
};
var socket;
function connectSocketIfNotOpen(host) {
  return new Promise((resolve, reject) => {
    socket = new WebSocket(host);
    socket.onopen = (e) => {
      resolve(socket);
    };
    setTimeout(() => {
      reject(new Error("connection timed outt"));
    }, 5000);
  });
}
connectSocketIfNotOpen(host).then((ws) => {
  output("connected");
  let txt;
  socket.onmessage = ({ data }) => {
    txt = data;

    if (txt && txt.startsWith("filecontent")) {
      const lines = txt.replace("filecontent\n", ""); //.split("\n");
      msgChannel.postMessage({
        cmd: "filecontent",
        data: lines
      })
    }
    //   if(socket.binaryType)
    try {
      const obj = JSON.parse(data);
      obj.cmd = obj.cmd || obj.type;
      msgChannel.postMessage(obj);
    } catch (e) {
      //msgChannel.postMessage(data.toString());
    }
  };
  socket.send("list");
});


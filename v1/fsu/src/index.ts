import { Stream, Writable } from "stream";

const wrtc = require("wrtc");
const { RTCPeerConnection } = wrtc;
let pc2;
var RTCSessionDescription = wrtc
  .createOffer()
  .then((o) => (pc2 = new wrtc.RTCSessionDescription(o)))
  .then((s) => pc2.setLocalDescription(s))
  .then(console.log)
  .catch(console.error).RTCSessionDescription;
const config1 = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
};

const logEvents = (pc: RTCPeerConnection) => {
  pc.onconnectionstatechange = (e) => console.log(e);
  pc.onicecandidate = function ({ candidate }) {
    if (candidate.candidate) console.log(candidate.candidate);
    else {
      console.log("done");
    }
  };
};

async function connect() {
  const pc1 = new RTCPeerConnection(config1);
  const pc2 = new RTCPeerConnection(config1);

  [
    [pc1, pc2],
    [pc2, pc1],
  ].forEach(([pc1, pc2]) => {
    pc1.onicecandidate = ({ candidate }) => {
      if (candidate) {
        pc2.addIceCandidate(candidate);
      }
    };
  });
  const channel1 = pc1.createDataChannel("test");
  const pc2GotChannel = new Promise<RTCDataChannel>((resolve) => {
    pc2.ondatachannel = ({ channel }) => resolve(channel);
  });

  const offer = await pc1.createOffer();
  console.log(offer, new RTCSessionDescription(offer));
  await pc1.setLocalDescription(new RTCSessionDescription(offer));
  await pc2.setRemoteDescription(offer);
  const answer = await pc2.createAnswer();
  await Promise.all([
    pc2.setLocalDescription(answer),
    pc1.setRemoteDescription(answer),
  ]);

  const channel2: RTCDataChannel = await pc2GotChannel;
  const pc2GotData = new Promise<ArrayBuffer>((resolve) => {
    channel2.onmessage = ({ data }) => resolve(data);
  });
  const buf1 = new Uint8Array(265);
  buf1.forEach((x, i) => {
    buf1[i] = Math.random() * 255;
  });
  channel1.send(buf1);

  const received = new Uint8Array(await pc2GotData);

  console.log(received.toString());
}
connect();
setTimeout(() => {
  process.exit(0);
}, 5099);

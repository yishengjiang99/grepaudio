import EventEmitter from "../EventEmitter.js"
import { histogram2 } from "./functions.js";

const firebaseConfig = {
    apiKey: "AIzaSyAV4Q9le3SmcMVzogttnJSSxd4zikhBixw",
    authDomain: "dsp-over-rtc.firebaseapp.com",
    databaseURL: "https://dsp-over-rtc.firebaseio.com",
    projectId: "dsp-over-rtc",
    storageBucket: "dsp-over-rtc.appspot.com",
    messagingSenderId: "731533454193",
    appId: "1:731533454193:web:d62fcaf297e1fe5cf624d0",
    measurementId: "G-8RCQ4PX008"
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database().ref();


export function broadcast(ctx,senderId) {
    var yourId = "user-" + Math.floor(Math.random() * 10);
    var servers = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }, { 'urls': 'turn:numb.viagenie.ca', 'credential': 'webrtc', 'username': 'websitebeaver@mail.com' }] };
    var pc = new RTCPeerConnection(servers);
    pc.onicecandidate = (event => event.candidate ? sendMessage(senderId, JSON.stringify({ 'ice': event.candidate })) : console.log("Sent All Ice"));
    pc.onaddstream = (event => {
        var peerInput = ctx.createMediaStreamSource(event.stream);
        var av = ctx.createAnalyser();
        peerInput.connect(av).connect(ctx.destination);
        histogram2('band_freq_out', av);
        

    });
    var stream = ctx.createMediaStreamDestination().stream;
    
    pc.addStream(stream);

    function sendMessage(senderId, data) {
        var msg = database.push({ sender: senderId, message: data });
        msg.remove();
    }

    function readMessage(data, senderId) {
        console.log(data.val());

        var msg = JSON.parse(data.val().message);
        var sender = data.val().sender;
        if (sender != yourId) {
            if (msg.ice != undefined)
                pc.addIceCandidate(new RTCIceCandidate(msg.ice));
            else if (msg.sdp.type == "offer")
                pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
                    .then(() => pc.createAnswer())
                    .then(answer => pc.setLocalDescription(answer))
                    .then(() => sendMessage(yourId, JSON.stringify({ 'sdp': pc.localDescription })));
            else if (msg.sdp.type == "answer")
                pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    };

    database.on('child_added', readMessage);



}




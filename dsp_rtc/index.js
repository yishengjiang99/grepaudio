const express = require('express')
const app = express();
const httpport = process.env.PORT || 3333
var session = require('express-session')
const wrtc = require("wrtc");
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))
var rtcConnections = [];


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });
  

app.get("/list", function (req, res) {
    res.json(Object.values(rtcConnections))
})
app.get("/connect", async function (req, res, next) {

    try {
        var pc = new wrtc.RTCPeerConnection({
            sdpSemantics: 'unified-plan'
        });

 

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        pc.onIceCandidate = console.log;
        pc.index = rtcConnections.length;

        offer.index = pc.index;
        rtcConnections.push(pc);
        return res.json(offer);
    } catch (e) {
        console.log('err')
        next(e);
    }

    res.end("gg");
});

app.post("/answer/:id", async function (req, res, next) {
    var id = req.params.id;

    var pc = rtcConnections[id];
//    const pc = rtcConnections[req.body];

    if (!pc) res.sendStatus(404) && res.end("peer connection not found in with session id");
    console.log('rrr', req.body);


    pc.setRemoteDescription(req.body);
    res.end();

});
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }
    res.status(500)
    res.render('error', { error: err })
}
//https://github.com/node-webrtc/node-webrtc-examples/blob/master/lib/server/connections/webrtcconnection.js
async function waitUntilIceGatheringStateComplete(peerConnection, options) {
    if (peerConnection.iceGatheringState === 'complete') {
        return;
    }

    const { timeToHostCandidates } = options;

    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });

    const timeout = options.setTimeout(() => {
        peerConnection.removeEventListener('icecandidate', onIceCandidate);
        deferred.reject(new Error('Timed out waiting for host candidates'));
    }, timeToHostCandidates);

    function onIceCandidate({ candidate }) {
        if (!candidate) {
            options.clearTimeout(timeout);
            peerConnection.removeEventListener('icecandidate', onIceCandidate);
            deferred.resolve();
        }
    }

    peerConnection.addEventListener('icecandidate', onIceCandidate);

    await deferred.promise;
}

app.listen(httpport);
// const wrtc = require("wrtc");
// var pc = new wrtc.RTCPeerConnection();
// var transcoder = pc.addTransceiver('audio');


// var pc = new wrtc.RTCPeerConnection();
// var transcoder = pc.addTransceiver('audio');



// async function sendSDPWaitForResponse(desc){

//     // .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
//     // .then(() => remoteConnection.createAnswer())
//     // .then(answer => remoteConnection.setLocalDescription(answer))
// }

// async function connect(remotePeerSocket){
//     const  sendSDPAndWaitForResponse  =(sdp)=>{
//         return new Promise((resolve,reject)=>{
//             remotePeerSocket.send(JSON.stringify)
//         })
//     }
//     localConnection.createOffer()
//     .then(offer => localConnection.setLocalDescription(offer))
//     .then(desc => sendSDPAndWaitForResponse(desc))
//     .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
//     .catch(handleCreateDescriptionError);
// }




// let listener = new WebRtcConnection(1, {
//     beforeOffer: function(){
//         const audio = peerConnection.addTransceiver('audio');
//         const audioTransceiver = peerConnection.addTransceiver('video');

//     }
// })


// const { RTCAudioSink, RTCVideoSink } = require('wrtc').nonstandard;
// const ffmpeg = require('fluent-ffmpeg')
// const { StreamInput } = require('fluent-ffmpeg-multistream')
// const wrtc = require("wrtc");
// const express = require('express')
// const app = express()
// const httpport = process.env.PORT || 3333
// // var pc = new wrtc.RTCPeerConnection();
// // var transcoder = pc.addTransceiver('audio');





// // let listener = new WebRtcConnection(1, {
// //     beforeOffer: function(){
// //         const audio = peerConnection.addTransceiver('audio');
// //         const audioTransceiver = peerConnection.addTransceiver('video');

// //     }
// // })


// // const { RTCAudioSink, RTCVideoSink } = require('wrtc').nonstandard;
// // const ffmpeg = require('fluent-ffmpeg')
// // const { StreamInput } = require('fluent-ffmpeg-multistream')
// // const wrtc = require("wrtc");
// // const express = require('express')
// // const app = express()
// // const httpport = process.env.PORT || 3333
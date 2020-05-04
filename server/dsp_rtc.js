const express = require('express')
const bodyParser = require('body-parser');
const httpport = process.env.PORT || 4000
const wrtc = require("wrtc");
const { PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const { StreamInput,StreamOutput } = require('fluent-ffmpeg-multistream');
const { RTCAudioSink, RTCVideoSink,RTCAudioSource } = require('wrtc').nonstandard;
const WebSocket = require('ws');

var rtcConnections = [];
var signalServerclient = new WebSocket("https://api.grepawk.com/signal");

const SERVER_RTC_SERVICES = {
    audioFilter: {
        serverFunction: function (peerConnection, params) {
            const audioTransceiver = peerConnection.addTransceiver('audio');
            const audioTrack = new RTCAudioSink(audioTransceiver.receiver.track);

            const audioOutput = new RTCAudioSource();
            const outputTrack = audioOutput.createTrack();
            peerConnection.addTrack(outputTrack);


            const pipe = new PassThrough();
            var pipedToFFmpeg = false;
            var outputFormat=null;
    
            audioTrack.addEventListener('data', function (data, sampleRate, bitsPerSample, channelCount, numberOfFrames) {
                if(dataFormat === null)  dataFormat = { sampleRate, bitsPerSample, channelCount, numberOfFrames };
                console.log("audio track got data");
                if (pipedToFFmpeg == false) pipe.push(Buffer.from(data.buffer)) && (pipedToFFmpeg = true);
            });

            const stdout = new PassThrough();
            stdout.on("data",(chunk)=>{
                outputData.sample=e.data;
                audioOutput.onData({chunk, ...outputFormat});
            })
            ffmpeg().addInput(new StreamInput(pipe).url)
            .audioFilters("silencedetect=n=-50db:d=5")
            .on("start", (e) => { console.log('started') })
            .addOutput( stdout).on("end",(e)=>{ console.log("end") });
        }
    },
    radio: "SERVER_SENDING",
    sendFile: "SERVER_RECEIVING",
    tom: "SERVER_FRIEND"
}

signalServerclient.on('open', function () {
    Object.keys(SERVER_RTC_SERVICES).forEach(service => {
        signalServerclient.send(JSON.stringify({ type: "register_stream", channel_name: service }));
    })
})



const app = express();
var router = express.Router()

router.use(bodyParser.json());
router.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

router.get("/list", function (req, res) {
    res.json(Object.keys(SERVER_RTC_SERVICES))
})


router.get("/:service/connect", async function (req, res, next) {
    try {
        var pc = new wrtc.RTCPeerConnection({
            sdpSemantics: 'unified-plan'
        });
        const service = SERVER_RTC_SERVICES[req.params.service];
        if (!service) {
            return res.sendStatus(404);
        }
        service.serverFunction(pc);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        pc.onIceCandidate = console.log;
        pc.index = rtcConnections.length;

        offer.index = pc.index;
        rtcConnections.push(pc);
        console.log("dd");
        return res.json(offer);
    } catch (e) {
        console.log('err')
        next(e);
    }
});

router.post("/:service/answer/:id", async function (req, res, next) {
    var id = req.params.id;

    var pc = rtcConnections[id];

    if (!pc) res.sendStatus(404) && res.end("peer connection not found in with session id");
    console.log('rrr', req.body);


    pc.setRemoteDescription(req.body);
    res.end("answer set");

});

router.post("/:service/offer", async function (req, res) {
    var offer = req.body;

    var pc = new wrtc.RTCPeerConnection({
        sdpSemantics: 'unified-plan'
    });
    try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);


        await waitUntilIceGatheringStateComplete(pc, { timeToHostCandidates: 5000 });
        res.json(answer);
    } catch (e) {
        console.log(e);
        next(e);
    }


})
app.use(errorHandler);
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

module.exports=router;

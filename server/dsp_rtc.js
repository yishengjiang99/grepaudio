const express = require('express')
const bodyParser = require('body-parser');
const httpport = process.env.PORT || 4000
const wrtc = require("wrtc");
const { PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const { StreamInput, StreamOutput } = require('fluent-ffmpeg-multistream');
const { RTCAudioSink, RTCVideoSink, RTCAudioSource } = require('wrtc').nonstandard;
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
            audioTransceiver.sender.replaceTrack(outputTrack);
            console.log('audio filter');


            const sampleRate = audioTrack.sampleRate;;
            const bitsPerSample = 16;
            const numberOfFrames = 441800 / 100;
            const bitrate = bitsPerSample * sampleRate;
            const outputData = new Uint8Array(numberOfFrames * bitrate);
            const channelCount = 2;
            const data = {
                outputData,
                sampleRate,
                bitsPerSample,
                channelCount,
                numberOfFrames
            };

            const pipe = new PassThrough();
            var pipedToFFmpeg = false;
            var outputFormat = null;
            debugger;
            audioTrack.addEventListener('frame', function (data, sampleRate, bitsPerSample, channelCount, numberOfFrames) {
                console.log('onframe')
            });
            audioTrack.addEventListener('data', function (data) {
                pipe.push(Buffer.from(data.samples.buffer))
            });

            const stdout = new PassThrough();
            stdout.on("data", (chunk) => {
                console.log(chunk)
                sample = chunk;
                audioOutput.onData(data);
            })

            var proc = ffmpeg().preset("")
                .addInput(pipe)
                .on("error", function(e){ console.log(e, 'ERROR')})
                .on("start", (e) => { console.log('started') })
                .on("end", (e) => { debugger;  console.log("end", e); })
                .on("data", (e) => { console.log('ondata', e) })
                .pipe(audioOutput);

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
        service.serverFunction(pc,{});

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        // pc.onIceCandidate = console.log;
        pc.id = rtcConnections.length;

        rtcConnections.push(pc);

        console.log("dd");
        return res.json({
            id: pc.id,
            iceConnectionState: pc.iceConnectionState,
            connectionState: pc.connectionState,
            localDescription: pc.localDescription,
            signalingState: pc.signalingState,
            state:"" 
        })
    } catch (e) {
        console.log('err')
        next(e);
    }
});

router.post("/:service/answer/:id", async function (req, res, next) {
    var id = req.params.id;

    var pc = rtcConnections[id];

    if (!pc) res.sendStatus(404) && res.end("peer connection not found in with session id");

    const onIceConnectionStateChange = () => {
        console.log(pc.iceConnectionState);
    };

    pc.addEventListener('iceconnectionstatechange', onIceConnectionStateChange);



    await pc.setRemoteDescription(req.body);



    //res.end("answer set");
    return res.json({
        id: pc.id,
        iceConnectionState: pc.iceConnectionState,
        connectionState: pc.connectionState,
        localDescription: pc.localDescription,
        signalingState: pc.signalingState,
        state:"" 
    })

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
        console.log("ice candidate resolved");

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

module.exports = router;

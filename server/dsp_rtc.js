const express = require('express')
const bodyParser = require('body-parser');
const httpport = process.env.PORT || 4000
const wrtc = require("wrtc");
const { PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const { StreamInput, StreamOutput } = require('fluent-ffmpeg-multistream');
const { RTCAudioSink, RTCVideoSink, RTCAudioSource } = require('wrtc').nonstandard;
const WebSocket = require('ws');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ytdl = require('ytdl-core')

var rtcConnections = [];
var signalServerclient = new WebSocket("https://api.grepawk.com/signal");
const peerRTCConfig = {
    'RTCIceServers': [{url:'stun:stun01.sipphone.com'},
    {url:'stun:stun.ekiga.net'},
    {url:'stun:stun.fwdnet.net'},
    {url:'stun:stun.ideasip.com'},
    {url:'stun:stun.iptel.org'},
    {url:'stun:stun.rixtelecom.se'},
    {url:'stun:stun.schlund.de'},
    {url:'stun:stun.l.google.com:19302'},
    {url:'stun:stun1.l.google.com:19302'},
    {url:'stun:stun2.l.google.com:19302'},
    {url:'stun:stun3.l.google.com:19302'},
    {url:'stun:stun4.l.google.com:19302'},
    {
        url: 'turn:numb.viagenie.ca',
        credential: 'welcome',
        username: 'yisheng.jiang@gmail.com'
    }

],
    sdpSemantics: 'unified-plan'
}
const SERVER_RTC_SERVICES = {
    mirror:{
        serverFunction: (peerConnection)=>{
            const audioTransceiver = peerConnection.addTransceiver('audio');
            const videoTransceiver = peerConnection.addTransceiver('video');
            return Promise.all([
              audioTransceiver.sender.replaceTrack(audioTransceiver.receiver.track),
              videoTransceiver.sender.replaceTrack(videoTransceiver.receiver.track)
            ]);
        }
    },
    streamer:{
        serverFunction: (peerConnection,req) => {
            const format = req.params.format;
            console.log('try to create data chan');
            var channel = peerConnection.createDataChannel('napster');
            channel.onopen = function(){
                ffmpeg.setFfmpegPath(ffmpegPath);
                var input = new PassThrough();
                ytdl(req.params.vid, { audioFormat: 'mp3',filter:"audioonly",liveBuffer:30*418000})
                .pipe(input);
                var proc = ffmpeg().addInput(input).format('mp3')
;
                proc.ondata = function(){

                }
            }

            peerConnection.ondatachannel = function(evt){
                const dataChannel = evt.channel;
                console.log(dataChannel.stream);
                console.log('remote datachannel created');
                dataChannel.onopen = function(){
                    ffmpeg.setFfmpegPath(ffmpegPath);
                    const p = new PassThrough();
                    var vid = ytdl(req.params.vid, { audioFormat: 'mp3' });
                    vid.pipe(p);
                    console.log(p);
                    console.log("text tick");
                    var output = ffmpeg().addInput(p)
                    .format('mp3')
                    .pipe(new PassThrough())
                    .pipe(dataChannel.stream);
                    output.on('data',function(evt){
                        dataChannel.send(evt.data);
                    });
                }
            }      
        }
    },

    audioFilter: {
        serverFunction: function (peerConnection, param, res) {
            const audioTransceiver = peerConnection.addTransceiver('audio');
            const audioTrack = new RTCAudioSink(audioTransceiver.receiver.track);

            // const audioOutput = new RTCAudioSource();
            // const outputTrack = audioOutput.createTrack();
            audioTransceiver.sender.replaceTrack(audioTrack);
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

            audioTrack.addEventListener('frame', function (data, sampleRate, bitsPerSample, channelCount, numberOfFrames) {
                console.log('onframe')
            });
            audioTrack.addEventListener('data', function (data) {
                pipe.push(Buffer.from(data.samples.buffer))
            });

            peerConnection.on("close", audioTrack.end());

            stream.proc = ffmpeg()
            .addInput((new StreamInput(pipe)).url)
            .addInputOptions([
              '-f s16le',
              '-ar 48k',
              '-ac 1',
            ])
            .on('start', ()=>{
              console.log('Start recording >> ', stream.recordPath)
            })
            .on('end', ()=>{

                console.log("record end");            //   stream.recordEnd = true;
             // console.log('Stop recording >> ', stream.recordPath)
            }).output('output.wav')
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
    res.sendFile(__dirname + '/public/rtc.html');
});

router.get('/connections', function (req, res) {
    signalServerclient.send(JSON.stringify({type:"list"}));
    signalServerclient.onmessage(event=>{
        res.json(event.data);
    })
});

router.get("/list", function (req, res) {
    res.json(Object.keys(SERVER_RTC_SERVICES))
})


router.get("/:service/connect", async function (req, res, next) {
    try {
        var pc = new wrtc.RTCPeerConnection(peerRTCConfig);
        const service = SERVER_RTC_SERVICES[req.params.service];
        if (!service) {
            return res.sendStatus(404);
        }
        service.serverFunction(pc,req);

        const offer = await pc.createOffer();

        await pc.setLocalDescription(offer);

        
        var iceCandidates = await waitUntilIceGatheringStateComplete(pc, { timeToHostCandidates: 5000 });

        pc.id = rtcConnections.length;

        rtcConnections.push(pc);

        console.log("dd");
        return res.json({
            id: pc.id,
            iceConnectionState: pc.iceConnectionState,
            connectionState: pc.connectionState,
            localDescription: pc.localDescription,
            signalingState: pc.signalingState,
	        iceCandidates: iceCandidates
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
        console.log('ice candidate'+pc.iceConnectionState);
    };
    var { offer, iceCandidates } = req.body;

    await pc.setRemoteDescription(offer);
    iceCandidates.forEach(can=> pc.addIceCandidate(can));

    var s_iceCandidates = await waitUntilIceGatheringStateComplete(pc, { timeToHostCandidates: 5000 });
    console.log("s_candidates in post answer", s_iceCandidates);
    //res.end("answer set");
    return res.json({
        id: pc.id,
        iceConnectionState: pc.iceConnectionState,
        connectionState: pc.connectionState,
        localDescription: pc.localDescription,
        signalingState: pc.signalingState,
        iceCandidates: s_iceCandidates,
        state:"" 
    })

});

router.use("/:service/offer/(:vid).(:format)", async function (req, res) {
    console.log(req.params.vid);
    try {
        const service = SERVER_RTC_SERVICES[req.params.service];
        if (!service) {
            return res.sendStatus(404);
        }

        var pc = new wrtc.RTCPeerConnection(peerRTCConfig);
        pc.id = rtcConnections.length;
        rtcConnections.push(pc);
        var { offer, iceCandidates } = req.body;
        service.serverFunction(pc,req);

       await pc.setRemoteDescription(new wrtc.RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

       var icecandidates =  await waitUntilIceGatheringStateComplete(pc, { timeToHostCandidates: 5000 });
        console.log("ice cans "+icecandidates);

        return res.json({
            id: pc.id,
            iceConnectionState: pc.iceConnectionState,
            connectionState: pc.connectionState,
            localDescription: pc.localDescription,
            signalingState: pc.signalingState,
            iceCandidates: icecandidates,
        })
        } catch (e) {
          console.log(e);
    }
})



app.use(errorHandler);
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }
    res.status(500)
    res.json({ error: err })

}

//https://github.com/node-webrtc/node-webrtc-examples/blob/master/lib/server/connections/webrtcconnection.js
async function waitUntilIceGatheringStateComplete(peerConnection, options) {
    if (peerConnection.iceGatheringState === 'complete') {
        return [];
    }

    const { timeToHostCandidates } = options;

    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    var candidates=[];

    const timeout = setTimeout(() => {
        peerConnection.removeEventListener('icecandidate', onIceCandidate);
	   deferred.resolve(candidates);
    }, timeToHostCandidates);

    function onIceCandidate({ candidate }) {

        if (!candidate) {
            clearTimeout(timeout);
            peerConnection.removeEventListener('icecandidate', onIceCandidate);
            deferred.resolve(candidates);
        }else{
            candidates.push(candidate)

        }
    }

    peerConnection.addEventListener('icecandidate', onIceCandidate);

    await deferred.promise;
}

module.exports = router;

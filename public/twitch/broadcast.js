import EventEmitter from "../EventEmitter.js"
const peerRTCConfig = {
    'RTCIceServers': [{
        url: 'turn:numb.viagenie.ca',
        credential: 'welcome',
        username: 'yisheng.jiang@gmail.com'
    }]
}

const signalServerURL = window.location.hostname == 'localhost' ? "ws://localhost:9091" : "wss://dsp.grepawk.com/signal";
var channelName = window.location.search.replace("?","")

function create_UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
export function BroadcasterClient(config) {
    config = config || {};
    const hostname = config.hostname || signalServerURL;
    config.onEvent = config.onEvent || function (event) {
        debug("event: ", event)
    }
    const onEvent = config.onEvent;
    let signalConnection;
    let peerConnections = {};
    let _stream;
    var host_uuid;
    var eventEmitter = new EventEmitter();
    var clientConnection;
    function sendJson(json, to_uuid) {
        if (to_uuid) json[to_uuid] = to_uuid;
        signalConnection.send(JSON.stringify(json));
    }
    function requestSync(str) {

        var uuid = create_UUID();
        return new Promise((resolve, reject) => {
            eventEmitter.once(uuid + "_resp", (e) => resolve(e.data));
            // setTimeout(function () {
            //     reject(new Error("timeout"));
            // }, 150010)
            const cmd = str.split(" ")[0];
            const msg = str.replace(cmd + " ");
            signalConnection.send(JSON.stringify({ id: uuid, type: cmd, msg: msg }));

        })
    }
    function connect() {
        return new Promise((resolve, reject) => {
            signalConnection = new WebSocket(hostname);
            signalConnection.onopen = resolve;
            signalConnection.onmessage = signal_on_msg;
 
        });
    }
    function startBroadcast(stream, channelName) {
        return new Promise((resolve, reject) => {
            _stream = stream;
            sendJson({
                type: "register_stream",
                channel: channelName
            })
            eventEmitter.once("registered", resolve);
        })
    }


    function signal_on_msg(event) {
        const data = JSON.parse(event.data);
        onEvent({ from: "signal_msg", ...event.data.type });
        switch (data.type) {
            case 'registered':
                host_uuid = data.host_uuid;
                eventEmitter.emit("registered");
                break;
            case 'user_joined':
                user_join_request(data);
                break;
            case 'answer':
                user_sent_sdp_answser(data);
                break;
            case 'candidate':
                user_sent_peer_ice_candidate(data);
                break;
            case 'user_left':
                break;
            case 'connected':
                log("connected to signal");
                break;
            case 'offer':
                onEvent("got offer: host_uuid=", data.host_uuid);
                gotSDP(data.offer, data.host_uuid);
                break;

            case 'error':
                onEvent("Error: " + data.message);
                break;
            default:
                eventEmitter.emit(data.type, data);
                break;
        }
        if (data.tid) {
            eventEmitter.emit(data.tid + '_resp', data);
        }
    }
    var audioTag_;
    function watchChannel(channelName, audioTag){
        audioTag_ = audioTag;
        signalConnection = new WebSocket(hostname);
        signalConnection.onopen = function (e) {
            signalConnection.send(JSON.stringify({
                type: "watch_stream",
                channel: channelName
            }))

            signalConnection.onmessage = function (event) {
                let data = JSON.parse(event.data);
                onEvent("Signal Server msg type "+data.type);
                switch (data.type) {
                    case 'offer':
                        onEvent("got offer: host_uuid=", data.host_uuid);
                        gotSDP(data.offer, data.host_uuid);
                        break;
                    case 'candidate':
                        onEvent("got candidate");
                        clientConnection.addIceCandidate(data.candidate);
                        break;

                    case 'error':
                        onEvent("Error: "+data.message);
                        break;
                    default:
                        break;
                }
            }
        }
    }


    function user_sent_peer_ice_candidate(data) {
        if (!data.client_uuid || !data.candidate) throw new Error("unexpected request in user_sent_peer_ice_candidate");
        peerConnections[data.client_uuid].addIceCandidate(data.candidate);
        debug("add peer ice candidate from " + data.client_uuid);
    }

    function user_sent_sdp_answser(data) {
        if (!data.client_uuid || !data.answer) throw new Error("unexpected request in user_sent_peer_ice_candidate");
        peerConnections[data.client_uuid].set_sdp_anwser(data.answer);
    }

    function user_join_request(data) {
        if (!data.client_uuid) throw new Error("unexpected user_join request");
        peerConnections[data.client_uuid] = BroadcasterRTCConnection(signalConnection, data.client_uuid, host_uuid);
        peerConnections[data.client_uuid].updateTracks(_stream.getTracks());
    }

    async function gotSDP(offer, hostId) {
        host_uuid = hostId;
        var remoteTracks ={};
        var remoteTrackMetaData={};
        clientConnection = new RTCPeerConnection(peerRTCConfig);
        clientConnection.ondatachannel = function (evt) {
            evt.channel.onopen = () => onEvent("metadata channel on client open");
            evt.channel.onmessage = (e) => {
                onEvent("got metadata " + e.data);
                let data = JSON.parse(e.data);
                if (data.type == 'mediaMetadata') {
                    let mediaDescriptors = data.data;
                    mediaDescriptors.forEach(trackMetaData => {
                        let trackId = trackMetaData.trackId;
                        remoteTrackMetaData[trackId] = trackMetaData;
                    });
                }
                showRemoteTracks();
            }
        }

        function showRemoteTracks() {
            onEvent("showing remote tracks: " + Object.keys(remoteTrackMetaData).length);
            for (let trackId in remoteTrackMetaData) {
                let metadata = remoteTrackMetaData[trackId];

                if(remoteTracks[trackId]){
                    let stream = new MediaStream();
                    stream.addTrack(remoteTracks[trackId]);
                    

                    onEvent("showing tracking ");
                }else{
                    remoteTracks[trackId]=trackId;
                    // let stream = new MediaStream();
                    // stream.addTrack(remoteTracks[trackId]);
                    // mediaObjectReady(trackId, stream,remoteTracks[trackId].kind, metadata.dimensions);
                    // onEvent("showing tracking ");

                    onEvent("Got meta data but not track")
                }

            }
        }

        clientConnection.onicecandidate = (e) => {
            onEvent("client on ice candidate ", e);
            if (e.candidate) {
                signalConnection.send(JSON.stringify({
                    type: "candidate",
                    to_uuid: host_uuid,
                    candidate: e.candidate
                }))
            }
        }

        clientConnection.ontrack = (e) => {
            log('on tracks ');
            const audioStream = e.streams[0];
            var ctx = new AudioContext();

                        // if (e.track) {
            //     remoteTracks[e.track.id] = e.track;
            // }
          //  var remote=ctx.createMediaStreamSource(e.track);
            audioTag_.srcObj = e.track;
            audioTag_.autoPlay = true;
            // remote.connect(ctx.destination);
            // console.log(e);
            // if (e.track) {
            //     remoteTracks[e.track.id] = e.track;
            // }
            // showRemoteTracks();
        }

        await clientConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await clientConnection.createAnswer();
        clientConnection.setLocalDescription(answer);
        signalConnection.send(JSON.stringify({
            type: "answer",
            to_uuid: host_uuid,
            answer: answer
        }))
    }

    return {
        peerConnections: peerConnections,
        startBroadcast: startBroadcast,
        connect: connect,

        remoteStreams: async function () {
            return await requestSync("list");
        },
        setStream: function (stream) {
            _stream = stream;
        },
        watchChannel: watchChannel
    }
}

function BroadcasterRTCConnection(signalConnection, client_uuid, host_uuid) {
    var signalConnection = signalConnection;
    var client_uuid = client_uuid;
    var host_uuid;
    var peerConnection = new RTCPeerConnection(peerRTCConfig);
    peerConnection.onicecandidate = (e) => {
        if (e.candidate) {
            signalConnection.send(JSON.stringify({
                type: "candidate",
                candidate: e.candidate,
                to_uuid: client_uuid,
                host_uuid: host_uuid
            }));
        }
    }
    peerConnection.onnegotiationneeded = async (evt) => {
        debug("creating sdp offer for " + client_uuid, evt);
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signalConnection.send(JSON.stringify({
            type: "offer",
            to_uuid: client_uuid,
            offer: offer,
            host_uuid: host_uuid
        }))
    }

    var trackMap = {};


    return {
        updateTracks: function (tracks) {
            tracks.forEach(track => {
                peerConnection.addTrack(track);

                // if (!!trackMap[track.id]) {
                //     debug("skip existing track");
                // }
                // trackMap[track.id] = 1;
                // debug("adding new track ", track);
              //  peerConnection.addTrack(track);
            })
        },
        set_sdp_anwser: async function (answer) {
            try {
                await peerConnection.setRemoteDescription(answer);
                debug("Remote Anwser set");
            } catch (e) {
                debug("ERROR: in set_dsp_anwser", e);
            }
        },
        addIceCandidate: function (candidate) {
            debug("add ice candidate ", candidate);
            peerConnection.addIceCandidate(candidate);
        }
    }
}

function BroadcasterUI(config) {
    var config = config || {};
    config = Object.assign({
        rootElement: 'obs',
        previewElement: "preview",
        controlElement: "controls",
        consoleElement: "console",
        screenShareBtn: 'screenshare_button',
        camBtn: "cam_button",
        startBroadcastBtn: "start_broadcast",
        dimensions: {
            'screenShare': [0, 0, 1400, 800],
            'camera': [0, 0, 400, 400]
        }
    }, config);
    let screenShareStream;
    const rootElement = document.getElementById(config.rootElement);
    const screenVideo = document.querySelector("video#screenshare");
    const cameraVideo = document.querySelector("video#camera");
    const mixer = document.querySelector("canvas#mixer");
    let tracks = {};

    const screenShareBtn = document.getElementById(config.screenShareBtn);
    const camBtn = document.getElementById(config.camBtn);
    const startBroadcastBtn = document.getElementById(config.startBroadcastBtn);
    var broadcastClient;
    var canvasStream;
    const consoleDiv = $("#" + config.consoleElement);

    function init() {
        signalConnection = new WebSocket(signalServerURL);
        screenShareBtn.addEventListener("click", screenShareOnClick);
        camBtn.addEventListener("click", cameraButtonOnClick);
        document.getElementById("start_broadcast").addEventListener("click", start_broadcast);
    }

    var screenShareLive = false;
    var camShareLive = false;
    async function screenShareOnClick(e) {
        if (!screenShareLive) {
            try {
                screenShareStream = await navigator.mediaDevices.getDisplayMedia();
            } catch (e) {
                debug(e.message);
                return;
            }
            screenShareLive = true;
            var settings = screenShareStream.getVideoTracks()[0].getSettings();
            screenVideo.addEventListener("play", e => {
                tracks["screenShare"] = {
                    mediaSource: screenVideo,
                    zIndex: 0,
                    key: "screenShare",
                    width: settings.width,
                    height: settings.height,
                    ratio: 0.9
                }
                update_mixer();
            });
            screenVideo.srcObject = screenShareStream;
            e.target.innerHTML = "Stop screen share";
        } else {
            delete tracks['screenShare'];
            e.target.innerHTML = "Share screen";
            screenShareStream.getTracks().forEach(track => track.stop());
            screenShareLive = false;
            update_mixer();
        }
    }

    async function cameraButtonOnClick(e) {
        if (!camShareLive) {
            try {
                camStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
            } catch (e) {
                debug(e.message);
                return;
            }
            e.target.innerHTML = "Stop Camera";
            camShareLive = true;
            var settings = camStream.getVideoTracks()[0].getSettings();
            cameraVideo.addEventListener("play", e => {
                tracks["camera"] = {
                    mediaSource: cameraVideo,
                    zIndex: 1,
                    key: "camera",
                    width: settings.width,
                    height: settings.height,
                    ratio: 0.2
                }
                update_mixer();
            });
            cameraVideo.srcObject = camStream;

        } else {
            delete tracks['camera'];
            camShareLive = false;
            camStream.getTracks().forEach(track => track.stop());
            e.target.innerHTML = "Start Camera";
            update_mixer();
        }
    }


    function start_broadcast() {
        var channelName = $("#channel_name_input").val()
        channelName = channelName || localStorage.getItem("channel_name");
        if (!channelName) channelName = prompt("What is the channel name?");
        if (!channelName) {
            alert("channel name cannot be empty");
            return;
        }
        localStorage.setItem("channel_name", channeName);

        broadcastClient = BroadcasterClient({
            onEvent: function (evt) {
                debug("broadcast Client: ", evt);
            }
        });
        broadcastClient.startBroadcast(channelName);
        updateStreamTracksIfBroadcasting();
    }

    function updateStreamTracksIfBroadcasting() {
        if (broadcastClient && !canvasStream) {
            canvasStream = mixer.captureStream(100);
            broadcastClient.setStream(canvasStream);
        }
    }

    var mixerTimeoutID = null;

    function update_mixer() {
        if (mixerTimeoutID) {
            clearInterval(mixerTimeoutID);
            mixerTimeoutID = null;
        }
        const ctx = mixer.getContext("2d");
        const tracksOrder = Object.values(tracks).sort((a, b) => b.zIndex - a.zIndex);
        debug("tracksorder", tracksOrder);
        var maxW = 0;
        var maxH = 0;
        tracksOrder.forEach((track) => {
            if (track.width > maxW) maxW = track.width;
            if (track.height > maxH) maxH = track.height;
        })
        mixer.width = maxW * 0.8; //hack
        mixer.height = maxH * 0.8;

        function drawTracks() {

            tracksOrder.forEach((track, i, arr) => {
                if (i == 0) ctx.globalCompositeOperation = "source-over";
                else ctx.globalCompositeOperation = "destination-over";
                ctx.drawImage(track.mediaSource, 0, 0,
                    track.width, track.height,
                    0, 0, track.width * track.ratio, track.height * track.ratio);
            })
            timeoutId = setTimeout(drawTracks, 20);
        }
        debug("mixing tracks ", tracksOrder);
        drawTracks();
        updateStreamTracksIfBroadcasting();
    }

    return {
        init: init
    }
}
const start = new Date().getTime();

function debug(msg, obj) {
    const t = new Date().getTime() - start;
    window.log("t" + t + ": " + msg);
    if (window.log) window.log("t" + t + ": " + msg);
    else $("#debug").append("<br>t" + t + ": " + msg);

    if (obj) window.log(JSON.stringify(obj).replace("\r\n", "<br>"));
}


function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}



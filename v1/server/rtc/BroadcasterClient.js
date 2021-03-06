const WebSocket = require('ws');

const peerRTCConfig = require("./RTCConfigs.js");
const signalServerURL = "wss://api.grepawk.com/signal";
const ytdl = require('ytdl-core')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const FFmpeg = require('fluent-ffmpeg');
const RTCPeerConnection = require("wrtc").RTCPeerConnection;
const RTCDataChannel = require("wrtc").RTCDataChannel;

function BroadcasterClient(config) {
    config = config || {};
    config.console = config.console || "console";

    const hostname = config.hostname || signalServerURL;
    let onEvent = config.onEvent || console.log;
    let signalConnection;
    let peerConnections = {};
    let localTracks = [];
    var host_uuid;
    var prepareStream = config.prepareStream || function (peerConnection, arg1, arg2) {

    }

    function trackDescriptor(id, track, dimensions) {
        return {
            id: id, track: track, dimensions: dimensions, live: true
        }
    }
    function addTrack(track, dimensions) {
        for (var idx in localTracks) {
            if (localTracks[idx].id === track.id) {
                localTracks[idx] = trackDescriptor(track.id, track, dimensions);
            }
        }
        localTracks.push(trackDescriptor(track.id, track, dimensions));
    }
    function removeTrack(track) {
        for (var idx in localTracks) {
            if (localTracks[idx].id === track.id) {
                localTracks[idx].live = false;
            }
        }
    }
    function sendJson(json, to_uuid) {
        if (to_uuid) json[to_uuid] = to_uuid;
        signalConnection.send(JSON.stringify(json));
    }
    function broadcastAudio(channelName, source) {
        startBroadcast(channelName);
        addStream(source)
    }
    function startBroadcast(channelName) {
        signalConnection = new WebSocket(hostname);
        signalConnection.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onEvent(event.data.type || "");
            switch (data.type) {
                case 'registered':
                    host_uuid = data.host_uuid;
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
                    onEvent("connnected to signal");
                default:
                    break;
            }
        }
        signalConnection.onopen = (e) => {
            sendJson({
                type: "register_stream",
                channel: channelName
            });
            onEvent("Stream registered " + channelName);
        }
        signalConnection.onerror = (e) => onEvent("ERROR: signalconnection not connecting", e);
    }

    function user_sent_peer_ice_candidate(data) {
        if (!data.client_uuid || !data.candidate) throw new Error("unexpected request in user_sent_peer_ice_candidate");
        peerConnections[data.client_uuid].addIceCandidate(data.candidate);
        onEvent("add peer ice candidate from " + data.client_uuid);
    }

    function user_sent_sdp_answser(data) {
        if (!data.client_uuid || !data.answer) throw new Error("unexpected request in user_sent_peer_ice_candidate");
        peerConnections[data.client_uuid].set_sdp_anwser(data.answer);
    }

    function user_join_request(data) {
        if (!data.client_uuid) throw new Error("unexpected user_join request");
        peerConnections[data.client_uuid] = BroadcasterRTCConnection(signalConnection, data.client_uuid, host_uuid, onEvent);
        peerConnections[data.client_uuid].updateTracks(localTracks);
        if (config.prepareStream) {
console.log("prepare stream for "+data.client_uuid+" args "+data.args[0]);
            config.prepareStream(peerConnections[data.client_uuid].peerConnection, data.args[0], data.args[1]);
        }

    }
    function updateTrackForPeers() {
        Object.values(peerConnections).forEach(client => {
            client.updateTracks(localTracks);
        })
    }

    function addStream(stream, dimensions) {
        debugger;
        stream.getTracks().forEach(track => {
            addTrack(track, dimensions);
        })
        updateTrackForPeers();
    }

    function removeStream(stream) {
        stream.getTracks().forEach((track) => {
            removeTrack(track);
            track.stop();
        })
        updateTrackForPeers();
        return null;
    }

    function requestUserStream(type) {
        return new Promise(async (resolve, reject) => {
            try {
                let stream;
                if (type == "screenshare") {
                    stream = await navigator.mediaDevices.getDisplayMedia();
                } else if (type == "webcam") {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                } else if (type == "audio") {
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                } else {
                    reject(new Error("Unkown type"))
                }
                if (stream) resolve(stream);
                else resolve(null);
            } catch (e) {
                reject(e);
            }
        })
    }

    return {
        requestUserStream: requestUserStream,
        addStream: addStream,
        removeStream: removeStream,
        peerConnections: peerConnections,
        startBroadcast: startBroadcast,
        broadcastAudio: broadcastAudio
    }
}
function BroadcasterRTCConnection(signalConnection, client_uuid, host_uuid, onEvent) {
    var signalConnection = signalConnection;
    var client_uuid = client_uuid;
    var host_uuid;
    var peerConnection = new RTCPeerConnection(peerRTCConfig);
    var metadataChannel = peerConnection.createDataChannel("metadata");
    console.log("preapring local desc for "+client_uuid);

    var offer; 
    peerConnection.createOffer().then(_offer=>{
        offer = _offer;
        peerConnection.setLocalDescription(offer)
     
    }).then(function(){  
       signalConnection.send(JSON.stringify({
            type: "offer",
            to_uuid: client_uuid,
            offer: offer,
            host_uuid: host_uuid
      }))
    });

    
    var trackMap = {};

    metadataChannel.onopen = function () {
        onEvent("Meta channel open with " + client_uuid);
        sendMetaData();
    }
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
        onEvent("creating sdp offer for " + client_uuid);
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signalConnection.send(JSON.stringify({
            type: "offer",
            to_uuid: client_uuid,
            offer: offer,
            host_uuid: host_uuid
        }))
    }
    function sendMetaData() {
        if (!metadataChannel || metadataChannel.readyState !== 'open') {
            onEvent("metadata channel not yet o0pen");
            setTimeout(sendMetaData, 1000);
            return;
        }

        let metadata = [];
        let trackIds = Object.keys(trackMap);
        trackIds.forEach(trackId => {
            let track = trackMap[trackId];
            metadata.push({
                trackId: track.id,
                dimensions: track.dimensions,
                live: track.active
            })
        })
        let payload = {
            type: "mediaMetadata",
            data: metadata
        }
        onEvent("sending metadata ", payload);
        metadataChannel.send(JSON.stringify(payload));
    }

    return {
        updateTracks: function (tracks) {
            for (var idx in tracks) {
                let trackId = tracks[idx].id;
                if (typeof trackMap[trackId] !== 'undefined') {
                    continue;
                }
                trackMap[trackId] = tracks[idx];
                if (tracks[idx].live) peerConnection.addTrack(tracks[idx].track);
            }
            sendMetaData();
        },

        set_sdp_anwser: async function (answer) {
            try {
                await peerConnection.setRemoteDescription(answer);
                onEvent("Remote Anwser set");
            } catch (e) {
                onEvent("ERROR: in set_dsp_anwser");
            }
        },
        addIceCandidate: function (candidate) {
            onEvent("add ice candidate ");
            peerConnection.addIceCandidate(candidate);
        },
        peerConnection: peerConnection
    }
}

// 
module.exports = BroadcasterClient;

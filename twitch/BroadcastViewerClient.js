const signalServerURL = window.location.hostname == 'localhost' ? "ws://localhost:9091" : "wss://api.grepawk.com/signal";
const peerRTCConfig = {
    'RTCIceServers': [{ url: 'stun:stun01.sipphone.com' },
    { url: 'stun:stun.ekiga.net' },
    { url: 'stun:stun.fwdnet.net' },
    { url: 'stun:stun.ideasip.com' },
    { url: 'stun:stun.iptel.org' },
    { url: 'stun:stun.rixtelecom.se' },
    { url: 'stun:stun.schlund.de' },
    { url: 'stun:stun.l.google.com:19302' },
    { url: 'stun:stun1.l.google.com:19302' },
    { url: 'stun:stun2.l.google.com:19302' },
    { url: 'stun:stun3.l.google.com:19302' },
    { url: 'stun:stun4.l.google.com:19302' },
    { url: 'stun:stunserver.org' },
    { url: 'stun:stun.softjoys.com' },
    { url: 'stun:stun.voiparound.com' },
    { url: 'stun:stun.voipbuster.com' },
    { url: 'stun:stun.voipstunt.com' },
    { url: 'stun:stun.voxgratia.org' },
    { url: 'stun:stun.xten.com' },
    {
        url: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
    },
    {
        url: 'turn:numb.viagenie.ca',
        credential: 'welcome',
        username: 'yisheng.jiang@gmail.com'
    },
    {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
    },
    {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
    }]
}


function BroadcastViewerClient(config) {
    const hostname = config.hostname || signalServerURL;
    let onEvent = config.onEvent || console.log;
    let mediaObjectReady = config.mediaObjectReady || console.log;

    let signalConnection;
    let clientConnection;
    let remoteTracks = {};
    let remoteTrackMetaData = {};
    let metadataChannel;
    let host_uuid;
    let audioCtx = window.g_audioCtx;

    signalConnection = new WebSocket(hostname);
    signalConnection.onopen = function (e) {
        signalConnection.onmessage = function (event) {
            let data = JSON.parse(event.data);
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
                    onEvent("Error: " + data.message);
                    break;
                default:
                    break;
            }
        }
    }



    function listChannels() {
        return new Promise((resolve, reject) => {
            signalConnection.send(JSON.stringify({
                    type: "watch_stream",
                    channel: channelName,
                    args: [arg1, arg2] 
                
            }))
        })
    }

    function watchChannel(channelName, arg1, arg2) {
        signalConnection.send(JSON.stringify({
            type: "list",
        }))

    }

    async function gotSDP(offer, hostId) {
        host_uuid = hostId;
        clientConnection = new RTCPeerConnection(peerRTCConfig);
        clientConnection.ondatachannel = function (evt) {
            var channel = evt.channel;

            if(channel.binaryType=='arrayBuffer'){
                channel.onopen = () => {
                    log("binary chan open")
                    channel.onmessage = ( message )=>{
                        audioCtx.decodeAudioData(message.data).then(audioBuffer=>{
                            source.buffer = audioBuffer;  
                            gotRemoteStream(source.stream);
                            source.oncanplay = ()=>this.play();
                        });
                    }
                }
            }

            evt.channel.onopen = () => onEvent("metadata channel on client open====");

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
            // for (let trackId in remoteTrackMetaData) {
            //     let metadata = remoteTrackMetaData[trackId];
            //     if (remoteTracks[trackId]) {
            //         let stream = new MediaStream();
            //         stream.addTrack(remoteTracks[trackId]);
            //         mediaObjectReady(trackId, stream, remoteTracks[trackId].kind, metadata.dimensions);
            //         onEvent("showing tracking ");
            //     } else {
            //         // let stream = new MediaStream();
            //         // stream.addTrack(remoteTracks[trackId]);
            //         // mediaObjectReady(trackId, stream,remoteTracks[trackId].kind, metadata.dimensions);
            //         // onEvent("showing tracking ");

            //         onEvent("Got meta data but not track")
            //     }

            // }
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
        var remoteTracks = [];
        clientConnection.ontrack = (e) => {
            remoteTracks.push(e.track);
            mediaObjectReady(new MediaStream(remoteTracks));
        }
        clientConnection.onaddstream = (e) => {
            mediaObjectReady(e.streams[0])
        }
        await clientConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await clientConnection.createAnswer();
        clientConnection.setLocalDescription(answer);
        signalConnection.send(JSON.stringify({
            type: "answer",
            to_uuid: host_uuid,
            answer: answer
        }))
        /*
            "connectionstatechange": Event;
    "datachannel": RTCDataChannelEvent;
    "icecandidate": RTCPeerConnectionIceEvent;
    "icecandidateerror": RTCPeerConnectionIceErrorEvent;
    "iceconnectionstatechange": Event;
    "icegatheringstatechange": Event;
    "negotiationneeded": Event;
    "signalingstatechange": Event;
    "statsended": RTCStatsEvent;
    "track": RTCTrackEvent;*/
        clientConnection.addEventListener("connectionstatechange", e => {
            if (e.target.connectState == 'connected') {
                mediaObjectReady(new MediaStream(remoteTracks));
            }
        });
        clientConnection.addEventListener("iceconnectionstatechange", console.log);
        clientConnection.addEventListener("negotiationneeded", console.log);
        clientConnection.addEventListener("signalingstatechange", console.log);
        clientConnection.addEventListener("statsended", console.log);
        clientConnection.addEventListener("track", console.log);
        clientConnection.addEventListener("icecandidateerror", console.log);


    }
    return {
        watchChannel: watchChannel,
        listChannels: listChannels
    }
}
export default BroadcastViewerClient;

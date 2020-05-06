
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
    {url:'stun:stunserver.org'},
    {url:'stun:stun.softjoys.com'},
    {url:'stun:stun.voiparound.com'},
    {url:'stun:stun.voipbuster.com'},
    {url:'stun:stun.voipstunt.com'},
    {url:'stun:stun.voxgratia.org'},
    {url:'stun:stun.xten.com'},
    {
        url: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
    },
    {
         url: 'turn:numb.viagenie.ca',
        credential: 'welcome',
        username: 'yisheng.jiang@gmail.com'
	}
    ],
    sdpSemantics: 'unified-plan'
}


const list_services = function (container,gotRemoteStream) {
    var onoff={}, pcs ={};
    fetch("/api/rtc/list").then(res => res.json()).then(json => {
        json.map(service => {
            onoff[service]='off';
            
            var b = document.createElement("button");
            b.onclick = async function (e) {
                if(onoff[service]=='on'){
                    pcs[service].close();
                    onoff[service]='on';
                    b.innerText='close';
                }else{
                    onoff[service]='on';
                    b.innerText='close';
                    pcs[service] = await connectToService(service, gotRemoteStream);

                }
            }
            b.innerText = service;
            container.append(b);
        })
    });
}

function sleep(ms){ return new Promise( (resolve, reject) => setTimeout(resolve, ms))}

  
const waitAndGatherIceCandidates = function(pc, timeout){
    return new Promise( (resolve, reject) => {
        var iceCans = [];

        let t =setTimeout(function(){
            resolve(iceCans)
        },timeout);

        pc.onicecandidate= (evt)=>{
            if(evt.candidate) {
                iceCans.push(evt.candidate);
            }
            else {
                resolve(iceCans);
            }
        }
    });

}

async function connectToDataService(audioCtx, service, gotRemoteStream){
    // var offlineCtx = new OfflineAudioContext(2,10*audioCtx.sampleRate, audioCtx.sampleRate);
    // var source = offlineCtx.createBufferSource();
    // var buffer = offlineCtx.createBuffer(2, 3*audioCtx.sampleRate, audioCtx.sampleRate);
    // source.connect(offlineCtx.destination);
    // var output;
    // var channel = pc.createDataChannel('napster');
 
    //   channel.onmessage= ( msg )=>{
    //     if(!output){
    //         source.start();
    //         output = audioCtx.createBufferSource();
    //         offlineCtx.startRendering().then(function(renderedBuffer) {
    //             output = audioCtx.createBufferSource();
    //             output.buffer = renderedBuffer;
    //             gotRemoteStream(output);
    //         });
    //     }
    //     buffer.push(msg.data);
    // };

    try{    
        var start = audioCtx.currentTime;

        var pc = new RTCPeerConnection(peerRTCConfig);
        var channel;
        var source = audioCtx.createBufferSource();
        var buffer;
        pc.onchannel = ({channel})=>{
            log('received channel @'+(audioCtx.currentTime-start));
            channel.onopen = () =>log("channel open @"+(audioCtx.currentTime-start));
            channel.onmessage = ( message )=>{
                audioCtx.decodeAudioData(message.data).then(audioBuffer=>{
                    source.buffer = buffer;  
                    gotRemoteStream(source.stream);
                    source.oncanplay = ()=>this.play();
                });
            }

        }

        var offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        //https://local.grepawk.com/api/rtc/streamer/offer/gg.mp3
        await fetch(service,{
            method: 'POST',
            body: JSON.stringify({offer: pc.localDescription}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(resp=>resp.json()).then(ret=>{
            if(ret.localDescription){
                pc.setRemoteDescription(ret.localDescription);
                window.pc = pc;

            }
        }).catch(err=>{
            alert("ajax err "+err.message);
            throw err;
        })
    }catch(err){
        alert('signaling err'+err.message);
        throw err;
    }


}

async function connectToService(vid, service,gotRemoteStream){

        try {

            var yourVideo = document.getElementById("yourVideo");
            var friendsVideo = document.getElementById("friendsVideo");
            const res = await fetch("/api/rtc/" + service + "/connect/")
            const remotePeer = await res.json();
            var pc = new RTCPeerConnection(peerRTCConfig);
            pc.oniceconnectionstatechange=function(){
                console.log(" ice state "+pc.iceConnectionState);
            }
            var icecandidates=[];
            pc.onicecandidate = function(ev){
                console.log("onice can");
              icecandidates.push(ev.candidate);
            }
            await pc.setRemoteDescription(new RTCSessionDescription(remotePeer.localDescription));
            const localStream = await window.navigator.mediaDevices.getUserMedia({
                audio: false,
                video: true
            });
  
            yourVideo.srcObject=localStream;
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

            try{
                const remoteStream = new MediaStream(pc.getReceivers().map(receiver => receiver.track));
                friendsVideo.srcObject=remoteStream; 
                gotRemoteStream(remoteStream);
    
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                window.pc = pc;
                await fetch("/api/rtc/" + service + "/offer", {
                    method: 'POST',
                    body: JSON.stringify({offer: pc.localDescription, iceCandidates:icecandidates }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(resp=>resp.json()).then(ret=>{
                    if(ret.iceCandidates){
                        ret.iceCandidates.forEach(c=>pc.addIceCandidate(c));
                    }
                    if(ret.localDescription){
                        pc.setRemoteDescription(ret.localDescription);
                        window.pc = pc;
                    }
                    waitAndGatherIceCandidates(pc, 1000);
                });
            }catch(e){
                alert(e.message)
            }
            return pc;
        }catch (e) {
            log(e.message);
            throw e;
        }
    }

const https_rtc_client = {
    list_services, connectToService,connectToDataService
}

export default https_rtc_client;

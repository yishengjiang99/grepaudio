
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

var yourVideo = document.getElementById("yourVideo");
var friendsVideo = document.getElementById("friendsVideo");


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

    
async function connectToService(service,gotRemoteStream) {

        try{
            const res = await fetch("/api/rtc/" + service + "/connect")
            const remotePeer = await res.json();
            var pc = new RTCPeerConnection(peerRTCConfig);
            var icecandidates=[];
            pc.onicecandidate = function(ev){
              icecandidates.push(ev.candidate);
            }
            await pc.setRemoteDescription(new RTCSessionDescription(remotePeer.localDescription));
            const localStream = await window.navigator.mediaDevices.getUserMedia({
                audio: false,
                video: true
            });

            yourVideo.srcObject=localStream;
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

            const remoteStream = new MediaStream(pc.getReceivers().map(receiver => receiver.track));
          //  gotRemoteStream(gotRemoteStream);
            friendsVideo.srcObject=remoteStream; 
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            await sleep(2);
window.pc = pc;
            await fetch("/api/rtc/" + service + "/answer/" + remotePeer.id, {
                method: 'POST',
                body: JSON.stringify({offer: pc.localDescription, iceCandidates:icecandidates }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(resp=>resp.json()).then(ret=>{
                if(ret.iceCandidates){
                    ret.iceCandidates.forEach(c=>pc.addIceCandidate(c));
                }

            });
            return pc;
        }catch (e) {
            log(e.message);
            throw e;
        }
    }

const https_rtc_client = {
    list_services, connectToService
}

export default https_rtc_client;



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


    async function connectToService(service,gotRemoteStream) {

        try{
            const res = await fetch("https://dsp.grepawk.com/api/rtc/" + service + "/connect")
            const remotePeer = await res.json();
            var pc = new RTCPeerConnection(peerRTCConfig);
            await pc.setRemoteDescription(new RTCSessionDescription(remotePeer.localDescription));
            const localStream = await window.navigator.mediaDevices.getUserMedia({
                audio: {echoCancellation:true},
                video: true
            });
            yourVideo.srcObject=localStream;
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

            const remoteStream = new MediaStream(pc.getReceivers().map(receiver => receiver.track));
          //  gotRemoteStream(gotRemoteStream);
            friendsVideo.srcObject=remoteStream; 
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);


            await fetch("https://dsp.grepawk.com/api/rtc/" + service + "/answer/" + remotePeer.id, {
                method: 'POST',
                body: JSON.stringify(pc.localDescription),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(resp=>resp.json()).then(ret=>{
  alert(JSON.stringify(ret));           
   if(ret.iceCandidates){
                debugger;
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

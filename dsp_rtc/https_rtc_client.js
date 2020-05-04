

const list_services = function (container,gotRemoteStream) {

    fetch("/api/rtc/list").then(res => res.json()).then(json => {
        json.map(service => {
            var b = document.createElement("button");
            b.onclick = function (e) {
                connectToService(service, gotRemoteStream);
            }
            b.innerText = service;
            container.append(b);
        })
    });
}


    async function connectToService(service,gotRemoteStream) {

        try{
            const res = await fetch("/api/rtc/" + service + "/connect")
            const remotePeer = await res.json();
            var pc = new RTCPeerConnection({
                sdpSemantics: 'unified-plan'
            });
            await pc.setRemoteDescription(new RTCSessionDescription(remotePeer.localDescription));
            const localStream = await window.navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

            const remoteStream = new MediaStream(pc.getReceivers().map(receiver => receiver.track));
          //  gotRemoteStream(gotRemoteStream);
             gotRemoteStream(remoteStream);    
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);


            await fetch("/api/rtc/" + service + "/answer/" + remotePeer.id, {
                method: 'POST',
                body: JSON.stringify(pc.localDescription),
                headers: {
                    'Content-Type': 'application/json'
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

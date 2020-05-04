

const https_rtc_client = function(container, options){
    options = {
        audioNode: null,
        service: 'audiofilter',
        customizePeerConnection: function(peerConnection){  console.log("about to call server")},
        gotRemoteTrack: function( track){ console.log('got track') },
        onError: e=>console.log(e),
        ...options
    }

    fetch("/api/rtc/list").then(res => res.json()).then(json=>{
        json.map( service => {
            var b = document.createElement("button");
            b.onclick=function(e){
                connectToService(options);
            }
            b.innerText=service;
            container.append(b);
        })
    });
    
   

    
    async function connectToService( options ) {

        const {audioNode, service, customizePeerConnection, gotRemoteTrack} = options;
    
        try{
 
        
            var peer = audioNode.context.createMediaStreamDestination();
            var ctx = audioNode.context;
            audioNode.connect(peer);
            var localStream =peer.stream;
            log("first call")

            const res = await fetch("/api/rtc/"+service+"/connect")
            const offer = await res.json();
            var pc = new RTCPeerConnection(options.rtcPeerConnectionOptions);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            log("first call done")

            customizePeerConnection(pc);      
            pc.ontrack = (e)=> gotRemoteTrack(e.track);

            await fetch("/api/rtc/answer/" + offer.index, {
                    method: 'POST',
                    body: JSON.stringify(pc.localDescription),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(resp => resp.text()).then(t => b.append(t)).catch( e=> options.onError(e));
           
            return pc;

        }catch(e){
            options.onError(e);
        }
    }

    return {
        connectToService
    }


}
export default https_rtc_client;
import {peerRTCConfig} from './constants.js';

const fetchPostJSON = (url, body)=>{
  debugger;
  return fetch(url, {
    method:"POST",
    body: JSON.stringify(body),
    headers: {  'Content-Type': 'application/json'}}
  );
}


export default async function joinChannel(channelName, localStream){
  var container = document.createElement("div");
  var localVideo = document.createElement("video");
  var remoteVideo = document.createElement("video");
  container.appendChild(localVideo);
  container.appendChild(remoteVideo)

  if(localStream) localVideo.srcObject = localStream;

  var pc = new RTCPeerConnection(peerRTCConfig);
  localStream.getTracks().forEach(t=> pc.addTrack(t));
  var cans = [];
  pc.onicecandidate = e=>cans.push(e.candidate); 
  var offer = await pc.createOffer();
  await pc.setLocalDescription(offer);


  fetchPostJSON("/api/postTracks", {offer: pc.localDescription,candidates:cans} )
  .then(resp=>resp.json())
  .then(async ret=>{
    pc.onicecandidate = e=> {
      fetchPostJSON("/api/postIce",{ id:pc.id, candidates: [e.candidate]});
    }

    if(!ret.localDescription) throw new Error('no server resp');
    pc.setRemoteDescription(ret.localDescription);
    pc.id = ret.id;
    var cans = await waitAndGatherIceCandidates(pc, 3000);
    fetchPostJSON("/api/postIce",{ id:pc.id, candidates: cans});
    pc.ontrack = function(ev){
      remoteVideo.srcObject = new MediaStream( [ev.track])
    }
    window.pc = pc;

   
  }).catch(e=>alert(e.message));
  return container;

}
        

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
          
            // resolve(iceCans);
          }
      }
    })
  };
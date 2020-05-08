window.localPeerConnection = localPeerConnection = new RTCPeerConnection(servers);
console.log('Created local peer connection object localPeerConnection');
localPeerConnection.onicecandidate = e => onIceCandidate(localPeerConnection, e);
sendChannel = localPeerConnection.createDataChannel('sendDataChannel', dataChannelOptions);
sendChannel.onopen = onSendChannelStateChange;
sendChannel.onclose = onSendChannelStateChange;
sendChannel.onerror = onSendChannelStateChange;

window.remotePeerConnection = remotePeerConnection = new RTCPeerConnection(servers);
console.log('Created remote peer connection object remotePeerConnection');
remotePeerConnection.onicecandidate = e => onIceCandidate(remotePeerConnection, e);
remotePeerConnection.ontrack = gotRemoteStream;
remotePeerConnection.ondatachannel = receiveChannelCallback;
localStream.getTracks().forEach(track => localPeerConnection.addTrack(track, localStream));
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };
const offer = await localPeerConnection.createOffer(offerOptions);
var ignore = await localPeerConnection.setLocalDescription(offer);
 ignore = await remotePeerConnection.setRemoteDescription(offer);
 const answer = await remotePeerConnection.createAnswer();
 ignore = await localPeerConnection.setRemoteDescription(answer);




 ignore = await localPeerConnection.setRemoteDescription(answer);
 const answer = {
    type: 'answer',
    sdp: sdp
};


const sdp = answerSdpTextarea.value
    .split('\n')
    .map(l => l.trim())
    .join('\r\n');
const answer = {
    type: 'answer',
    sdp: sdp
};


onSetSessionDescriptionSuccess();

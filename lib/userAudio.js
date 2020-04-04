
async function getAudioDevice(ctx) {
  if (!navigator.mediaDevices) {
    throw new Error("web rtc not available")
  }
  try{
    var stream = await navigator.mediaDevices.getUserMedia({audio:true});

   var video = new Video();
    video.srcObject = stream;
   video.onloadedmetadata = function(e) {
        video.play();
        video.muted = true;
    };
    document.appendChild(video);

    var ctx = ctx || new AudioContext();
    var source =ctx.createMediaStreamSource(stream);
    return source;
  }catch(e){
    throw e;
  }
}


export default {
  getAudioDevice
}
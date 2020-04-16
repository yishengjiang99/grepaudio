$("button").onclick = async function(e){
  var ctx;
  ctx = new AudioContext();
  await ctx.audioWorklet.addModule('../band_pass_lfc/index.js');

  log("loadding processor")
  var r = new AudioWorkletNode(ctx, 'band_pass_lfc_processor');
  var buffersource = await loadBuffer("https://dsp.grepawk.com/samples/song.mp3", ctx);
  log("loading soong0")
  buffersource.connect(r);
  r.connect(ctx.destination);
  buffersource.oncanplay = function(evt) {

       buffersource.connect(r).connect(ctx.destination);
      buffersource.play();
  }
  r.port.onmessage = e => {
    log("msg: "+e.data.msg);
  }
}

function loadBuffer(url, ctx) {
  return new Promise((resolve,reject)=>{
  const xhr = new XMLHttpRequest();
  var source = ctx.createBufferSource();
  source.autoplay=true;
  xhr.open("get", url, true);
  xhr.responseType = 'arraybuffer';
  xhr.setRequestHeader("Range", "Bytes:0-")
  var counter = 0;
  xhr.onload = function(evt) {
      ctx.decodeAudioData(xhr.response, function(processed) {
          source.buffer = processed;
          source.start();
          resolve(source);
      });
  }
  
  xhr.send();
  })

}

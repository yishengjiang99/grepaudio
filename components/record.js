let ctx;
let destination;
let queue = [];
let recorder;
let worker;
let btn;
let recording = false;
let audioTag;
function Recorder(ctx){
    if(btn) return btn;''
   var ctx = ctx;
   destination = ctx.createMediaStreamDestination();
   recorder = new MediaRecorder();
   recorder.ondataavailable = function(e){
       chunks.push(evt.data);
   }
   recorder.onstop=(e)=>{
    let blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
    audioTag = document.createElement('audio');
    audioTag.src = URL.createObjectURL(blob);
   }
   
   btn = document.createElement("button");
   btn.innerText = "record";
   btn.onclick=(e)=>{
       if(recording){
            recorder.stop();
            recorder.requestData();
            recording=false;
       }else{
            recording=true;
            recorder.start();
            tn.innerText("stop")
       }
   }
   
   var div = document.createElement("div");
   div.appendChild(audioTag);
   div.appendChild(btn);

   return div;

}

export default  Recorder;
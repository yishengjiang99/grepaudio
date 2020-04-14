import {StreamAnalyzerView} from '../AnalyzerView';

let ctx;
let destination;
let queue = [];
let recorder;
let worker;
let btn;
let recording = false;
let audioTag;

async function startUserMedia(){
  if(!mavigator.mediaDevices.getUserMedia){
    logErr("not supported on bhrowser");
    return;
  }

  const stream = navigator.mediaDevices.getUserMedia({audio:true});
  if(stream){
    recorder = new MediaRecorder(stream);
    StreamAnalyzerView(recorder).histogram("c1");

  }
}

function recordFromStream(stream){
  var recorder = new MediaRecorder(stream);
  StreamAnalyzerView(recorder).histogram("c1");

  const click = function(){
    recorder.start();
    log("rec state "+recorder.state);
  }
  
}


function Recorder(ctx){
    f(btn) return btn;''
   var ctx = ctx;
   if(ctx.state!=='running') ctx.resume();

   audioTag = document.createElement('audio');
   audioTag.controls=true;

   destination = ctx.createMediaStreamDestination();
 
   recorder = new MediaRecorder(destination.stream);
  
   recorder.ondataavailable = function(e){
     queue.push(e.data);
   }
   
   recorder.onstop=(e)=>{
    let blob = new Blob(queue, { 'type' : 'audio/ogg; codecs=opus' });

    audioTag.src = URL.createObjectURL(blob);
   }
   
   btn = document.createElement("button");
   btn.innerText = "record";

   var btnstop = document.createElement("button");
   btnstop.innerText = "stop";
  
   btn.onclick=(e)=>{
       if(recording===true){
           debugger;

            recorder.requestData();
            window.removeEventListener('click',this);
            recording=false;
            btn.innerText='resume';
       }else{
            
            if(recorder.state=='inactive') recorder.start();
            else recorder.resume();

            recording=true;
            btn.innerText = 'done'
       }
   }
  btnstop.onclick = e =>{
      recorder.stop();
      recorder.requestData();
  }

  var div = document.createElement("div");

   div.appendChild(audioTag);
   div.appendChild(btn);
   div.appendChild(btnstop);

   return{
       div, btn, audioTag, recording 
   };

}

export default  Recorder;

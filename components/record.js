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

const Recorder = function(ctx,containerId){
  let doneButton = $("#rec-done");
  let rec1=$("#rec");
  let ws=false;
  var ctx= ctx || new AudioContext();
  let rx1 = $("#rec-rx1");
  let logrrx1 = (txt) => rx1.innerHTML(txt);
  let destination;
  let recorder;
  rec1.onclick = function onclick(evt){
     evt.target.disabled=true;
     var lastState = evt.target.getAttribute("data-state") || "init";
     var newState;
     switch(lastState){
       case "init":
            evt.target.disabled=true;
            newState = 'recording';
           destination = ctx.createMediaStreamDestination();
           recordStream(destination.stream);
           evt.target.innerHTML="pause";
           evt.target.setAttribute("data-state", newState);
           evt.target.disabled=false;
           break;
       case "recording":
            evt.target.disabled=true;
            recorder.pause();
            doneButton.style.display='inline';
            newState = "stopped";
            evt.target.innerHTML="resume";
            evt.target.setAttribute("data-state", newState);
            evt.target.disabled=false;
            break;
        case "stopped":
            newState = "recording";
            evt.target.innerHTML="stop";
            doneButton.style.display = "none";
            evt.target.setAttribute("data-state", newState);
            ws.send("EOF");
            break;
        default: throw new Error("..");
            break;

      }
  };

  doneButton.onclick = ()=>{
    recorder.stop();
  }

  async function recordStream(stream){
    var options = { mimeType: "video/webm; codecs=vp9" };
    recorder = new MediaRecorder(stream);
    recorder.start();
    recorder.ondataavailable = function(evt){
      console.log('recorded ', evt.data);
      if(evt.data.length>0){
        decodedChunks.push(evt.data);
        ws.send(evt.data);
       }
        setTimeout(function(){
          if(recorder.state==='recording') recorder.requestData();
        },5000);
    }

    recorder.onstopped =function(evt){
        const blob = new Blob(recordedChunks, { 'type' : 'audio/ogg; codecs=opus' });
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        audio.src = audioURL;
    }

    setTimeout(function(){
        if(recorder.state==='recording') recorder.requestData();
    },5000);
  }

}


async function recordStream(stream){
  var options = { mimeType: codec };
  recorder = new MediaRecorder(stream);
  recorder.start();
  recorder.ondataavailable = function(evt){
    console.log('recorde3d ', evt.data);
    if(evt.data.length>0){
      decodedChunks.push(evt.data);
      ws.send(evt.data);
   }
  }
  var fetchTimer;
  recorder.onstart = function(evt){
      function fetchData(){
          fetchTimer = setTimeout(function(){
              if(recorder.state=='running') recorder.requestData() && fetchData();
          },1000);
      }
  }
  recorder.onstopped =function(evt){
      const blob = new Blob(recordedChunks, { 'type' : 'audio/ogg; codecs=opus' });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
  }

  setTimeout(function(){
      if(recorder.state==='recording') recorder.requestData();
  },5000);
}

async function recordUserMedia(){
  if(!navigator.mediaDevices.getUserMedia){
    logErr("not supported on bhrowser");
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({audio:true});
  if(stream){
    const audioNode = ctx.createMediaStreamSource(stream);
    visualize(stream);
    recordStream(stream);

  }else{
    logError("get steam fail")
  }
}

const codec = "audio/webm\;codecs=opus";

export default Recorder;

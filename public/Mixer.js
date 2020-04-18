import PlayableAudioSource from './audio_source.js'
export default async function(ctx,containerId) {
  var ctx = ctx;

  var inputs = [null,null,null,null,null];
  var channelQueues = [[],[],[],[],[]];
  var masterGain = ctx.createGain(1);
  var controls =new Array(5).fill( ctx.createGain(1));
  var rx1 = new Array(5).fill("");

  [0,1,2,3,4].forEach(i=> controls[i].connect(masterGain));

  const loadURLTo = async function (url, index, deviceId){
    if(url=='user-audio'){
      var source = await PlayableAudioSource(ctx).getAudioDevice(deviceId);

      inputs[index]=source;
      source.connect(controls[index]);
      return;
    }else{
      var source = ctx.createBufferSource();
      inputs[index]=source;
      return loadURL(url);
    }
    function loadURL(url){
      const xhr = new XMLHttpRequest();
      xhr.open("get", url,true);
      xhr.responseType='arraybuffer';
      xhr.setRequestHeader("Range","Bytes:0-")
      var counter = 0;

      xhr.onload= function(evt){
        counter++;
        log('loading '+url+ ' cpounter '+counter)
        ctx.decodeAudioData(xhr.response, function(processed){
          source.buffer = processed;
          source.connect(controls[index]);
          counter --;
          source.start();
        });
        source.autoplay=true;
      }
      xhr.onloadend = function(evt){
        if(channelQueues[index].length){
          var next = source.queue.shift();
          loadURL(next);
        }else{
          source.onended=function(evttt){
          }
        }
      }
      xhr.send();
    }
    return source;
  }


  const add_audio_tag = function(tagId,i){
    inputs[i] =  (tagId, controls[i]);
  };

  var outputNode = masterGain;

  function connect(node) {this.masterGain.connect(node)};
  var container = document.getElementById(containerId);

  ['YT_SEARCH', 'Microphone', 'notes.csv', 'drums.csv', 'songs.csv'].forEach( async (indexfile, index)=>{

    if(indexfile=='YT_SEARCH'){

      var select = document.getElementById("ytsearch");

    }else if(indexfile=='Microphone'){
      var select = document.getElementById("miccheck");
      select.setAttribute("data-userMedia", "audio");

      var select = document.createElement("select");
      select.setAttribute("tabindex", index);
      select.setAttribute("data-userMedia", "audio");
      navigator.mediaDevices.enumerateDevices().then(function(devices) {
        select.innerHTML=devices.filter(device=>device.kind=='audioinput').map(function(device) {
           return `<option value='${device.deviceId}'>${device.kind}: ${device.label}</option>`
        }).join("");
      }).catch(function(err) { select.innerHTML= err.message});
    }else if(indexfile==='notes.csv'){
      const song_db=await fetch("./samples/"+indexfile).then(res=>res.text()).then(text=>text.split("\n"));
      var select = document.createElement("span");
      select.setAttribute("tabindex", index);
      select.innerHTML = song_db.filter(t=>t.trim()!=="").map(t=>"samples/"+t.trim()).map(n => {
        var url = n.split(",")[0];
        var name = (n.split(",")[1] || url).split("/").pop();
        return `<button value='${encodeURIComponent(url)}'>${name}</button>`
      }); 

    }else{
      const song_db=await fetch("./samples/"+indexfile).then(res=>res.text()).then(text=>text.split("\n"));
      var select = document.createElement("select");
      select.setAttribute("tabindex", index);
      select.innerHTML = song_db.filter(t=>t.trim()!=="").map(t=>"samples/"+t.trim()).map(n => {
        var url = n.split(",")[0];
        var name = (n.split(",")[1] || url).split("/").pop();
        return `<option value='${encodeURIComponent(url)}'>${name}</option>`
      });
    }

    var apply = document.createElement("button")
    apply.innerHTML="go";
    var nowPlayingLabel = document.createElement("label");

    var stop = document.createElement("button")
    stop.innerHTML="stop";
    if(indexfile != 'YT_SEARCH') container.appendChild(select);

    container.appendChild(apply);
    container.appendChild(stop);
    container.appendChild(nowPlayingLabel.wrap("p"));
    stop.onclick = (e)=>{
      inputs[index].disconnect();
      inputs[index]=null;
      // instanceof MediaElementAudioSourceNode ?  inputs[index].mediaElement.pause() : inputs[index].stop();
    }
    select.querySelectorAll("button").forEach( button=> button.addEventListener("click", (e)=>{
      var url = e.target.value;
      loadURLTo(url, index);
    }))

    apply.onclick = loadURL;
    select.addEventListener("input|submit|change|click|touchup",loadURL);

    async function loadURL(){
      var url = select.value;
      if(select.getAttribute("data-host")){
        url = select.getAttribute("data-host").replace("::QUERY::", select.value);
      }else if(select.getAttribute("data-userMedia")){
        url = "user-audio";
        var deviceId = select.value;
        loadURLTo(url, index, deviceId);
        return;
      }else{
        url = select.value;
      }

      if( inputs[index] !== null ){
        await inputs[index].stop();
        inputs[index]=null;
        }
      loadURLTo(url,index);
      nowPlayingLabel.innerHTML="Loading.."+url + " channel "+index;

    }
    return false;

})




return {
  inputs, outputNode, controls,
  connect,
  add_audio_tag
}
}

const bindAudioTag = function(tagId, output){
  const myAudio = document.querySelector('audio#'+tagId);
  if(!myAudio) return false;
  const source = output.context.createMediaElementSource(myAudio);
  return source;
}

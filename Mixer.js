import PlayableAudioSource from './audio_source.js'
import Envelope from './envelope.js'
import { chord, slider, numeric } from './functions.js'
export default async function (ctx, containerId) {
  var ctx = ctx;

  var inputs = new Array(6).fill(null)
  var channelQueues = new Array(6).fill(new Array())
  var masterGain = ctx.createGain();

  var controls = new Array(6).fill(ctx.createGain());
  var rx1 = new Array(6).fill("");
  var nowPlayingLabels = [];
  [0, 1, 2, 3, 4,5].forEach(i => controls[i].connect(masterGain));

  const loadURLTo = async function (url, index, deviceId) {
    if (url == 'user-audio') {
      var source = await PlayableAudioSource(ctx).getAudioDevice(deviceId);

      inputs[index] = source;
      source.connect(controls[index]);
      return;
    }else if(deviceId=='chord'){
      
    } else {
      var source = ctx.createBufferSource();
      inputs[index] = source;
      return loadURL(url);
    }

    function loadURL(url) {
      nowPlayingLabels[index].innerHTML = 'loading '+url;
      const xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.responseType = 'arraybuffer';
      xhr.setRequestHeader("Range", "Bytes:0-")
      var counter = 0;
      xhr.onprogress = (e)=>{
        log(e.progress);
      }
      xhr.onreadystatechange = function () {
        nowPlayingLabels[index].innerHTML="ready state "+xhr.readyState;

        if (xhr.readyState > 2) {
          if (xhr.response !== null) {
            ctx.decodeAudioData(xhr.response, function (processed) {
              source.buffer = processed;
              source.connect(controls[index]);
              counter--;
              source.start();
            });
            source.autoplay = true;
          }
        }
      };
      xhr.onloadend = function (evt) {
        if (channelQueues[index].length) {
          var next = source.queue.shift();
          loadURL(next);
        } else {
          source.onended = function (evttt) {
          }
        }
      }
      xhr.send();
  }
    return source;
  }
  var audioPlayer

  const add_remote_stream = function (stream,i){
    inputs[i] = stream;

    inputs[i].connect(controls[i]).connect(masterGain);
    nowPlayingLabels[i].innerHTML = 'rtc stream';
  }
  const add_audio_tag = function (tagId, i) {
    audioPlayer = document.querySelector('audio#' + tagId);
    if (!audioPlayer) return false;
    var source = ctx.createMediaElementSource(audioPlayer);
    inputs[i] = source;
    inputs[i].connect(controls[i]).connect(masterGain);
    audioPlayer.oncanplay = function () {
      audioPlayer.play();
      // this.[i].play();
    }

    return source;
  };

  var outputNode = masterGain;

  function connect(node) { this.masterGain.connect(node) };
  var cp = document.getElementById(containerId);

  ['YT_SEARCH', 'Microphone', 'notes.csv', 'waves.csv', 'songs.csv'].forEach(async (indexfile, index) => {
    var container = document.createElement("div");
    container.className='text-white bg-secondary mb-2'
    var title = document.createElement("div");
    title.innerText=indexfile;
    var panel = document.createElement("div");
    container.append(title);
    container.append(panel)
    if (indexfile == 'YT_SEARCH') {

      var select = document.getElementById("ytsearch");
//       var select=document.createElement("span");
    } else if (indexfile == 'Microphone') {


      var select = document.createElement("select");
      select.setAttribute("tabindex", index);
      select.setAttribute("data-userMedia", "audio");
      navigator.mediaDevices && navigator.mediaDevices.enumerateDevices().then(function (devices) {
        select.innerHTML = devices.filter(device => device.kind == 'audioinput').map(function (device) {
          return `<option value='${device.deviceId}'>${device.label}</option>`
        }).join("");
      }).catch(function (err) { select.innerHTML = err.message });
    } else if (indexfile === 'waves.csv') {
      const song_db = await fetch("./samples/" + indexfile+"?t="+ctx.currentTime).then(res => res.text()).then(text => text.split("\n"));
      var select = document.createElement("form");
      var select = document.createElement("select")
      select.setAttribute("tabindex", index);
      select.innerHTML = song_db.filter(t => t.trim() !== "").map(t => "samples/" + t.trim()).map(n => {
        var url = n.split(",")[0];
        var name = (n.split(",")[1] || url).split("/").pop();
        return `<option value='${encodeURIComponent(url)}'>${name}</option>`
      });
      select.setAttribute("data-chord", 1);
      var buttons = "<button value='/samples/piano'>piano</input>";
      panel.appendstr(buttons);
      container.querySelectorAll("button").forEach(button=>button.addEventListener("click", (e) => {
        loadURL(e);
      }));
    } else if (indexfile === 'notes.csv') {
      const song_db = await fetch("./samples/" + indexfile).then(res => res.text()).then(text => text.split("\n"));
      var select = document.createElement("div");


      select.innerHTML = "<div class='btn-toolbar'>"+
      song_db.filter(t => t.trim() !== "").map((n, j) => {
        var url = "samples/"+n;
        var name = n.replace(".mp3","");
        return `<button class="btn btn-secondary" value='${url}'>${name}</button>`
      }).join("") + "</div>"

      select.querySelectorAll("button").forEach(button=>button.addEventListener("click", (e) => {
        var url = e.target.value;
        loadURLTo(url, index);
      }));

    } else {
      const song_db = await fetch("./samples/" + indexfile).then(res => res.text()).then(text => text.split("\n"));
      var select = document.createElement("select");
      select.setAttribute("tabindex", index);
      select.innerHTML = song_db.filter(t => t.trim() !== "").map(t => "samples/" + t.trim()).map(n => {
        var url = n.split(",")[0];
        var name = (n.split(",")[1] || url).split("/").pop();
        return `<option value='${encodeURIComponent(url)}'>${name}</option>`
      });
    }

    var apply = document.createElement("button")
    apply.innerHTML = "go";
    var nowPlayingLabel = document.createElement("label");

    var stop = document.createElement("button")
    stop.innerHTML = "stop";
    if (indexfile != 'YT_SEARCH') panel.appendChild(select.wrap("div"));

    panel.appendChild(nowPlayingLabel.wrap("div"));
    slider(panel, {prop: controls[index].gain, step:"0.01",  max:"2", min:"0",wrapper:"span"});
    container.append(panel)
    cp.appendChild(container)
    panel.appendChild(apply);
    panel.appendChild(stop);
    stop.onclick = (e) => {
      if( inputs[index] instanceof MediaStreamAudioSourceNode ){
        inputs[index].disconnect() 
      }else{
        inputs[index].stop();
      }
  //  ]    inputs[index] instanceof MediaStreamAudioSourceNode  ?  inputs[index].disconnect() : inputs[index].stop();
      inputs[index].disconnect();
      inputs[index] = null;
      inputs[index] instanceof MediaStreamAudioSourceNode  ?  inputs[index].disconnect() : inputs[index].stop();
    }
    select.querySelectorAll("button").forEach(button => button.addEventListener("click", (e) => {
      var url = e.target.value;
      loadURLTo(url, index);
    }))

    apply.onclick = loadURL;
    select.addEventListener("input", e=>{
      if(e.target.type !=='text'){
        loadURL(e);
      }
    });

    async function loadURL(e) {
      var url = select.value;
      log("loading "+url);
      if (select.getAttribute("data-chord")) {
        inputs[index] = await chord(url);
        inputs[index].connect(controls[index]);
        return false;
      } else if (select.getAttribute("data-host")) {
        url = select.getAttribute("data-host").replace("::QUERY::", select.value);
        audioPlayer.src = url;
        audioPlayer.oncanplay = function (evt) { audioPlayer.play() }
        inputs[index] = inputs[5];
        return;
      } else if (select.getAttribute("data-userMedia")) {
        url = "user-audio";
        var deviceId = select.value;
        loadURLTo(url, index, deviceId);
        return;
      } else {
        url = select.value;
      }

      if (inputs[index] !== null) {
        await inputs[index].stop();
        inputs[index] = null;
      }
      nowPlayingLabel.innerHTML = "Loading.." + url + " channel " + index;
      loadURLTo(url, index);
      stop.style.display='inline';
    }
    nowPlayingLabels[index] = nowPlayingLabel;
    return false;

  })




  return {
    inputs, outputNode, controls,
    connect, loadURLTo,
    add_audio_tag,add_remote_stream
  }
}

const bindAudioTag = function (tagId, output) {
  const myAudio = document.querySelector('audio#' + tagId);
  if (!myAudio) return false;
  const source = output.context.createMediaElementSource(myAudio);
  return source;
}




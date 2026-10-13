import PlayableAudioSource from "./audio_source.js";
import Envelope from "./envelope.js";
import { chord, slider, numeric } from "./functions.js";
export default async function (ctx, containerId) {
  var ctx = ctx;
  const audio1 = document.querySelector("audio#audio1");

  var inputs = new Array(6).fill(null);
  var channelQueues = new Array(6).fill(new Array());
  var masterGain = ctx.createGain();

  var controls = new Array(6).fill(ctx.createGain());
  var rx1 = new Array(6).fill("");
  var nowPlayingLabels = [];
  [0, 1, 2, 3, 4, 5].forEach((i) => controls[i].connect(masterGain));

  const loadURLTo = async function (url, index, deviceId) {
    if (url == "user-audio") {
      var source = await PlayableAudioSource(ctx).getAudioDevice(deviceId);

      inputs[index] = source;
      source.connect(controls[index]);
      return;
    } else if (deviceId == "chord") {
    } else {
      var source = ctx.createBufferSource();
      inputs[index] = source;
      return loadURL(url);
    }

    function loadURL(url) {
      nowPlayingLabels[index].innerHTML = "loading " + url;
      const xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.responseType = "arraybuffer";
      var counter = 0;

      xhr.onreadystatechange = function () {
        nowPlayingLabels[index].innerHTML = "ready state " + xhr.readyState;

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
          source.onended = function (evttt) {};
        }
      };
      xhr.send();
    }
    return source;
  };
  var audioPlayer;

  const add_remote_stream = function (stream, i) {
    inputs[i] = stream;

    inputs[i].connect(controls[i]).connect(masterGain);
    nowPlayingLabels[i].innerHTML = "rtc stream";
  };

  const add_audio_tag = function (tagId, i) {
    audioPlayer = document.querySelector("audio#" + tagId);

    if (!audioPlayer) return false;
    var source = ctx.createMediaElementSource(audioPlayer);
    inputs[i] = source;
    inputs[i].connect(controls[i]).connect(masterGain);
    audioPlayer.oncanplay = function () {
      audioPlayer.play();
    };

    return source;
  };

  var outputNode = masterGain;

  function connect(node) {
    this.masterGain.connect(node);
  }
  var cp = document.getElementById(containerId);

  // Only real, existing sources. CSV sample banks are missing and were injecting HTML.
  const sources = [
    "YT_SEARCH",
    "RTC",
    "Microphone",
  ];

  sources.forEach(async (indexfile, index) => {
    var container = document.createElement("div");
    container.className = "text-white bg-secondary mb-2 p-2";
    var title = document.createElement("div");
    title.className = "font-weight-bold mb-1";
    title.innerText = indexfile;
    var panel = document.createElement("div");
    container.append(title);
    container.append(panel);

    let select = null;

    if (indexfile == "YT_SEARCH") {
      var audio1 = document.querySelector("audio#audio1");
      if (audio1) panel.append(audio1);
    } else if (indexfile == "RTC") {
      var videoRtc = document.createElement("video");
      videoRtc.id = "rtc";
      videoRtc.setAttribute("controls", "");
      videoRtc.setAttribute("playsinline", "");
      videoRtc.style.width = "100%";

      var source = ctx.createMediaElementSource(videoRtc);
      inputs[index] = source;
      inputs[index].connect(controls[index]).connect(masterGain);
      videoRtc.oncanplay = function () {
        videoRtc.play();
      };
      panel.appendChild(videoRtc);
    } else if (indexfile == "Microphone") {
      select = document.createElement("select");
      select.className = "form-control form-control-sm mb-1";
      select.setAttribute("tabindex", index);
      select.setAttribute("data-userMedia", "audio");
      if (navigator.mediaDevices) {
        navigator.mediaDevices
          .enumerateDevices()
          .then(function (devices) {
            select.innerHTML = devices
              .filter((device) => device.kind == "audioinput")
              .map(function (device) {
                return `<option value='${device.deviceId}'>${device.label || "Mic"}</option>`;
              })
              .join("") || "<option>No mics</option>";
          })
          .catch(function (err) {
            select.innerHTML = `<option>${err.message}</option>`;
          });
      }
      panel.appendChild(select);
    }

    var nowPlayingLabel = document.createElement("div");
    nowPlayingLabel.className = "small text-muted mb-1";
    panel.appendChild(nowPlayingLabel);

    slider(panel, {
      prop: controls[index].gain,
      step: "0.01",
      max: "2",
      min: "0",
      wrapper: "span",
    });

    var apply = document.createElement("button");
    apply.className = "btn btn-sm btn-light ml-1";
    apply.innerHTML = "go";
    var stop = document.createElement("button");
    stop.className = "btn btn-sm btn-light ml-1";
    stop.innerHTML = "stop";

    panel.appendChild(apply);
    panel.appendChild(stop);

    stop.onclick = (e) => {
      if (inputs[index] instanceof MediaStreamAudioSourceNode) {
        inputs[index].disconnect();
      } else if (inputs[index] && inputs[index].stop) {
        inputs[index].stop();
      }
      if (inputs[index]) inputs[index].disconnect();
      inputs[index] = null;
    };

    if (select) {
      select.addEventListener("change", (e) => {
        if (select.getAttribute("data-userMedia")) {
          loadURLTo("user-audio", index, select.value);
        }
      });
    }

    cp.appendChild(container);
    nowPlayingLabels[index] = nowPlayingLabel;
  });

  return {
    inputs,
    outputNode,
    controls,
    connect,
    loadURLTo,
    add_audio_tag,
    add_remote_stream,
  };
}

const bindAudioTag = function (tagId, output) {
  const myAudio = document.querySelector("audio#" + tagId);
  if (!myAudio) return false;
  const source = output.context.createMediaElementSource(myAudio);
  return source;
};

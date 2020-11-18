import Mixer from "./Mixer.js";
import NoiseGate from "./NoiseGate/NoiseGate.js";
import { split_band } from "./splitband.js";
import AnalyzerView from "./AnalyzerView.js";
import loadBandPassFilters from "./band_pass_lfc/index.js";
import BroadcasterClient from "./twitch/BroadcastClient.js";
import BoardcastViewerClient from "./twitch/BroadcastViewerClient.js";
import { selector, slider, numeric } from "./functions.js";
import https_rtc_client from "./dsp_rtc/https_rtc_client.js";
import DrawEQ from "./draw.js";

let audioCtx, audioTag, eq;
const std1 = (str) => (document.getElementById("std1").innerHTML = str);

document.body.onload = async () => {
  audioCtx = new AudioContext();
  const bandpassFilterNode = await loadBandPassFilters(
    audioCtx,
    "band_pass_filter"
  );

  window.g_audioCtx = audioCtx;

  var audioTag = await Mixer(audioCtx, "ctrls");

  audioTag.add_audio_tag("audio1", 0);
  const audio1 = $("#audio1");
  window.g_audioTag = audioTag;
  var noiseGate = new NoiseGate(audioCtx);
  noiseGate.port.postMessage("ping");
  noiseGate.port.onmessage = (evt) => {
    log(JSON.stringify(evt.data));
  };
  audioTag.outputNode.connect(noiseGate.input);
  noiseGate.output.connect(bandpassFilterNode);

  var cursor = bandpassFilterNode;

  var compressor = new DynamicsCompressorNode(audioCtx, {
    threshold: -10,
    ratio: 20,
    knee: 10,
  });

  var group = split_band(audioCtx, [
    31.25,
    62.5,
    125,
    250,
    500,
    1000,
    2000,
    4000,
    8000,
    16000,
  ]);
  bandpassFilterNode.connect(compressor).connect(group.input);

  $("#eq_update_form").appendChild(group.UI_EQ(bandpassFilterNode, compressor));
  cursor = group.output;

  var drawEQ = DrawEQ(audioCtx, group.bands);

  var ctv = AnalyzerView(cursor, {
    fft: 1024,
    onFftGot: (dataFrame, analyzer) => {
      drawEQ.postFrameFromFFT(dataFrame, analyzer);
    },
  });

  // geq.drawOverlayFrequencies(ctv.analyzer);
  ctv.histogram("output_freq", 700, 300); //, { fft: 256 })
  ctv.timeseries("output_timeline", 128, 700, 300); //, { fft: 256 })

  var recorderProcessor = audioCtx.createScriptProcessor(1024, 2, 2);
  var counter = 0;
  recorderProcessor.onaudioprocess = (e) => {
    // The input buffer is the song we loaded earlier
    var inputBuffer = e.inputBuffer;

    // The output buffer contains the samples that will be modified and played
    var outputBuffer = e.outputBuffer;
    var buffer = [];
    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      var inputData = inputBuffer.getChannelData(channel);
      var outputData = outputBuffer.getChannelData(channel);
      if (isRecording) buffer.push(inputData);

      // Loop through the 4096 samples
      for (var sample = 0; sample < inputBuffer.length; sample++) {
        // make output equal to the same as the input
        outputData[sample] = inputData[sample];
      }
    }
    if (!isRecording) return;
    rworker.postMessage({
      command: "record",
      buffer: buffer,
    });
    counter += buffer.length;
  };

  var playbackGain = audioCtx.createGain({ gain: 1 });

  ctv.analyzer.connect(recorderProcessor);

  recorderProcessor.connect(playbackGain);
  playbackGain.connect(audioCtx.destination);

  var isRecording = false;
  var chunks = [];
  const outputdiv = $("#output_cp");
  const rtcViewer = $("video#rtc");

  const playbackGainSlider = slider(outputdiv, {
    wrap: "inline",
    prop: playbackGain.gain,
    min: "0",
    max: "4",
    step: "0.05",
    label: "Local Playback gain",
  });

  var bv = BoardcastViewerClient({
    onEvent: log,
    mediaObjectReady: function (stream) {
      var streamsource = audioCtx.createMediaStreamSource(stream);
      streamsource.connect(ctv.analyzer);
      rtcViewer.srcObject = stream;
      rtcViewer.autoplay = true;
    },
  });

  if (location.hash && location.hash.substr(1)) {
    var cmd = location.hash.substr(1).split("/")[0];
    var arg1 = location.hash.substr(1).split("/")[1];
    switch (cmd) {
      case "watch":
      case "listen":
        std1("connecting to " + arg1);

        bv.watchChannel(arg1);

        break;
      default:
        break;
    }
  }

  bv.listChannels().then((channels) => {
    for (const channel of Object.values(channels)) {
      var a = document.createElement("a");
      a.className = "dropdown-item";
      a.onclick = function () {
        bv.watchChannel(channel.name);
      };
      a.href = "#listen:" + channel.name;
      a.innerText = channel.name;
      $("#listen-menu").append(a);
    }
  });
  $("#obs").onclick = function (e) {
    var userId =
      window.location.search.replace("?", "") ||
      prompt("enter display name", localStorage.getItem("displayName") || "") ||
      "user_" + Math.floor(Math.random() * 10);

    var peer = audioCtx.createMediaStreamDestination();
    playbackGain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + 0.1
    );
    playbackGainSlider.value = "0.001";
    recorderProcessor.connect(peer);
    localStorage.setItem("displayName", userId);
    BroadcasterClient({
      onEvent: window.log,
    }).broadcastAudio(userId, peer.stream);
    std1(
      `Broadcasting now to <input type=text id=urlinput size=80 value='https://dsp.grepawk.com/#listen/${userId}'>`
    );
    document.getElementById("cplink").style.display = "inline";
  };

  const audio22 = $("video#rtc");

  $("#recorder").onclick = function (e) {
    var t;
    function showCounter() {
      document.getElementById("rinfo").innerHTML = counter / 1000 + "kb";
      t = setTimeout(showCounter, 1000);
    }
    if (isRecording == false) {
      showCounter();
      isRecording = true;
      e.target.innerText = "Done";
    } else {
      isRecording = false;
      rworker.postMessage({
        command: "exportWAV",
        type: "audio/wav",
      });
      e.target.innerText = "record";

      cancelAnimationFrame(t);
    }
  };
  var rworker = new Worker("recorder-worker.js");
  var rconfig = { sample: 2 << 16, channels: 1 };
  rworker.postMessage({
    command: "init",
    config: {
      sampleRate: audioCtx.sampleRate,
      numChannels: 2,
    },
  });

  rworker.onmessage = (e) => {
    if (e.data.audioUrl) {
      log(" got url " + e.data.audioUrl);
      $("#audio1").src = e.data.audioUrl;
      $("#audio1").controls = true;
      isRecording = false;
      $("#rdownload").innerHTML = `<a href='${e.data.audioUrl}'>Download</a>`;
    }
  };

  window.vfs = [
    group,
    audioTag,
    noiseGate,
    bandpassFilterNode,
    audioCtx,
    group,
  ];

  window.index_stdin = function (str) {
    const cmd = str.split(" ")[0];
    const arg1 = str.split(" ")[1] || "";
    const arg2 = str.split(" ")[2] || "";
    switch (cmd) {
      case "debug":
        switch (arg1) {
          case "group":
            group.aggregate_fr();
            break;
          default:
            break;
        }
      case "ls":
        return JSON.stringify(window.g_audioTag);
        break;
      case "fullscreen":
      case "terminal":
      case "term":
        $("#app1").style.display = "none";
        simpleConsole.element.style.height = "100vh";
        return true;
      case "ls":
        var str = window.vfs
          .map((obj) => objs.toString())
          .forEach((str) => log(str));
        log(str);
        return true;
      case "v":
      case "video":
        g_audioTag.loadURLTo("/api" + arg1 + ".mp3", 1);
      default:
        return false;
    }
  };

  simpleConsole.element.style.zIndex = 99;
  simpleConsole.element.addEventListener("click", function () {
    this.querySelector("input").focus();
  });
  window.onkeydown = function (evt) {
    if (evt.code == "Enter") {
      simpleConsole.element.querySelector("input").focus();
    }
  };

  var blobbb = window.URL || window.webkitURL;

  document.getElementById("file").addEventListener("change", function (event) {
    var file = this.files[0];
    var fileURL = blobbb.createObjectURL(file);
    $("#audio2").src = fileURL;
    $("#audio2").autoplay = true;
  });
};
window.copylink = function () {
  document.getElementbyId("urlinput").select();
  document.select();
  document.copy();
  this.innerText = "copied";
};
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").then((reg) => {
      console.log("Service worker registered.", reg);
    });
  });
}

import Mixer from "./Mixer.js";
import NoiseGate from "./NoiseGate/NoiseGate.js";
import { split_band } from "./splitband.js";
import AnalyzerView from "./AnalyzerView.js";
import BandPassFilterNode from "./band_pass_lfc/BandPassFilterNode.js";
import BroadcasterClient from "./twitch/BroadcastClient.js";
import BoardcastViewerClient from "./twitch/BroadcastViewerClient.js";
import { selector, slider, numeric } from "./functions.js";
import https_rtc_client from "./dsp_rtc/https_rtc_client.js";
import DrawEQ from "./draw.js";

let audioCtx, audioTag, eq;
// const overlay = document.getElementById("overlay");
const std1 = (str) => (document.getElementById("std1").innerHTML = str);

// document.getElementById("dre").onclick = main;
main();
async function main(e) {
  audioCtx = new AudioContext();
  await BandPassFilterNode.init(audioCtx);

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
  var bandpassFilterNode = new BandPassFilterNode(audioCtx);
  noiseGate.output.connect(bandpassFilterNode);

  var cursor = bandpassFilterNode;

  var compressor = new DynamicsCompressorNode(audioCtx, {
    threshold: -10,
    ratio: 20,
    knee: 10,
  });

  var group = split_band(
    audioCtx,
    [31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
  );
  audioTag.outputNode
    .connect(bandpassFilterNode)
    .connect(compressor)
    .connect(group.input);

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
        con.element.style.height = "100vh";
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

  // con.element.style.zIndex = 99;
  // con.element.addEventListener("click", function () {
  //   this.querySelector("input").focus();
  // });
  // window.onkeydown = function (evt) {
  //   if (evt.code == "Enter") {
  //     con.element.querySelector("input").focus();
  //   }
  // };

  var blobbb = window.URL || window.webkitURL;

  document.getElementById("file").addEventListener("change", function (event) {
    var file = this.files[0];
    var fileURL = blobbb.createObjectURL(file);
    $("#audio2").src = fileURL;
    $("#audio2").autoplay = true;
  });
}
window.copylink = function () {
  document.getElementbyId("urlinput").select();
  document.select();
  document.copy();
  this.innerText = "copied";
};

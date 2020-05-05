git    import equilizer from "./equalizer.js";
    import Mixer from './Mixer.js';
    import NoiseGate from './NoiseGate/NoiseGate.js'
    import { split_band } from './splitband.js'
    import AnalyzerView from "./AnalyzerView.js"
    import BandPassFilterNode from './band_pass_lfc/BandPassFilterNode.js'
    import BroadcasterClient from './twitch/BroadcastClient.js'
    import BoardcastViewerClient from './twitch/BroadcastViewerClient.js'
    import { selector, slider, numeric } from "./functions.js";

    let audioCtx, audioTag, eq;
    // const list = $("#serverlist")
    // fetch("/api/list").then(resp => resp.json()).then(json => {
    //   json.forEach(section => {
    //     list.appendstr(`<h4>${section.name}</h4>`);
    //     section.list.forEach(li => {
    //       list.appendstr(`<li>List1</li>`)
    //     })
    //   })
    // })


    $("#overlay").onclick = async function (e) {
      $("#overlay").style.zIndex = -99;

      this.style.display = 'none';

      audioCtx = new AudioContext();
      await audioCtx.audioWorklet.addModule('../band_pass_lfc/processor.js');

      window.g_audioCtx = audioCtx;

      var audioTag = await Mixer(audioCtx, "ctrls");

      audioTag.add_audio_tag("audio1", 5);
      const audio1 = $("#audio1");
      window.g_audioTag = audioTag;
      var noiseGate = new NoiseGate(audioCtx);
      noiseGate.port.postMessage("ping");
      noiseGate.port.onmessage = (evt) => {
        log(JSON.stringify(evt.data));
      }
      audioTag.outputNode.connect(noiseGate.input);
      var bandpassFilterNode = await new BandPassFilterNode(audioCtx);
      noiseGate.output.connect(bandpassFilterNode);



      var cursor = bandpassFilterNode;

      var compressor = new DynamicsCompressorNode(audioCtx, { threshold: -10, ratio: 20, knee: 10 });

      var group = split_band(audioCtx, [31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);
      bandpassFilterNode.connect(compressor).connect(group.input);


      $("#eq_update_form").appendChild(group.UI_EQ(bandpassFilterNode, compressor));




      cursor = group.output;
      var ctv = AnalyzerView(cursor, { fft: 256 });
      ctv.histogram("output_freq", 700, 300); //, { fft: 256 })
      ctv.timeseries("output_timeline", 128, 700, 300); //, { fft: 256 })

      var recorderProcessor = audioCtx.createScriptProcessor(1024, 2, 2);

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
          command: 'record',
          buffer: buffer
        });
      };


      var playbackGain = audioCtx.createGain({ gain: 1 });

      ctv.analyzer.connect(recorderProcessor);

      recorderProcessor.connect(playbackGain);
      playbackGain.connect(audioCtx.destination);

      var isRecording = false;
      var chunks = [];
      const outputdiv = $("#output_cp");

      const playbackGainSlider = slider(outputdiv, { prop: playbackGain.gain, min: "0", max: "4", step: "0.05", label: "Local Playback gain" });

      $("#recorder").onclick = function (e) {
        if (isRecording == false) {
          isRecording = true;
          e.target.innerText = 'Done'
        } else {
          isRecording = false;
          e.target.innerText = 'record'
          rworker.postMessage({
            command: "exportWAV"
          })
        }
      }

      $("#obs").onclick = function (e) {
        var userId = window.location.search.replace("?", "") 
        || prompt("enter display name", (localStorage.getItem("displayName") || "")) 
        || ("user_" + Math.floor(Math.random() * 10));

        var peer = audioCtx.createMediaStreamDestination();
        playbackGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        playbackGainSlider.value = "0.001";
        recorderProcessor.connect(peer);
        localStorage.setItem("displayName",userId)
        BroadcasterClient({
          onEvent: log
        }).broadcastAudio(userId, peer.stream);

      }
      const audio22 = $("video#rtc")
      $("#listen").onclick = function (e) {
        var bv = BoardcastViewerClient({
          onEvent: log, mediaObjectReady: function (stream) {

            audio22.srcObject = stream;
            audio22.play();
            //sream = new MediaStream([e.track]);
            var source = audioCtx.createMediaStreamSource(stream);
            audioTag.add_remote_stream(source, 1);
          }
        });


        bv.listChannels().then(channels => {
          for (const channel of Object.values(channels)) {
            var a = document.createElement("a");
            a.onclick = function () {
              bv.watchChannel(channel.name);
            }
            a.href = "javascript://"
            a.innerText = "watch"
            var li = document.createElement("li");
            li.append(a);
            li.appendstr(" " + channel.name);
            $("#channels").append(li);
          }
        });
      }

      var rworker = new Worker('recorder-worker.js');
      var rconfig = { sample: 2 << 16, channels: 1 };
      rworker.postMessage({
        command: 'init',
        config: {
          sampleRate: audioCtx.sampleRate,
          numChannels: 2,
        }
      });

      rworker.onmessage = (e) => {
        if (e.data.audioUrl) {
          log(" got url " + e.data.audioUrl)
          $("#audio2").src = e.data.audioUrl;
          $("#audio2").controls = true;
          $("#audio2").parentElement.appendstr(`<a href='${e.data.audioUrl}'>${e.data.audioUrl}</a>`)
        }
        console.log(e);
      };


      window.vfs = [group, audioTag, noiseGate, bandpassFilterNode, audioCtx, group];

      window.index_stdin = function (str) {
        const cmd = str.split(" ")[0];
        const arg1 = str.split(" ")[1] || "";
        const arg2 = str.split(" ")[2] || "";
        switch (cmd) {
          case 'debug':
            switch (arg1) {
              case 'group': group.aggregate_fr(); break;
              default: break;
            }
          case "ls":
            return JSON.stringify(window.g_audioTag)
            break;
          case 'fullscreen':
          case 'terminal':
          case 'term':
            $("#app1").style.display = 'none';
            con.element.style.height = '100vh';
            return true;
          case "ls":
            var str = window.vfs.map(obj => objs.toString()).forEach(str => log(str));
            log(str);
            return true;
          case 'v':
          case 'video':

            g_audioTag.loadURLTo("/api" + arg1 + ".mp3", 1);
            break;
          default: return false;
        }
      }

      if (location.hash) {
        window.index_stdin(location.hash)
      }

      con.element.style.zIndex = 99;
      con.element.addEventListener("click", function () { this.querySelector("input").focus() });
      window.onkeydown = function (evt) {
        if (evt.code == "Enter") {
          con.element.querySelector("input").focus();
        }
      }
    }



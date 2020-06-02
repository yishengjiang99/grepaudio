(function () {
  'use strict';

  function PlayableAudioSource(ctx) {

    async function getAudioDevice(deviceId) {
      if (!navigator.mediaDevices) {
        throw new Error("web rtc not available")
      }
      try {
        var stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: deviceId, echoCancellation: true } });

        var audio = document.createElement("audio");
        audio.srcObject = stream;
        audio.onloadedmetadata = function (e) {
          audio.muted = false;
          audio.control = true;
          audio.play();
        };
        document.body.appendChild(audio);
        var source = ctx.createMediaStreamSource(stream);
        return source;
      } catch (e) {
        throw e;
      }
    }

    function random_noise(audioCtx) {
      // Create an empty three-second stereo buffer at the sample rate of the AudioContext
      var myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * 3, audioCtx.sampleRate);

      // Fill the buffer with white noise;
      //just random values between -1.0 and 1.0
      for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
        // This gives us the actual ArrayBuffer that contains the data
        var nowBuffering = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < myArrayBuffer.length; i++) {
          // Math.random() is in [0; 1.0]
          // audio needs to be in [-1.0; 1.0]
          nowBuffering[i] = i >> 2;

        }
      }
      var source = audioCtx.createBufferSource();
      source.loop = true;
      // set the buffer in the AudioBufferSourceNode
      source.buffer = myArrayBuffer;

      return source;
    }

   

    return {
      random_noise,
      getAudioDevice    
    }

  }

  function Envelope(min, max, attack, decay, sustain, release, param) {
      this.min = min; //
      this.max = max;
      this.attack = attack;
      this.releaseTimeConstant = release;
      this.sustain = sustain;
      this.decay = decay;
      this.param = param;
  }

  Envelope.prototype.trigger = function (time) {
      this.attackTime = null;
      this.attackTime = time+this.attack;
      this.sustainTime =time+this.attack+this.sustain;
      this.param.linearRampToValueAtTime(this.max, this.attackTime);
      this.param.exponentialRampToValueAtTime(this.sustain, this.sustainTime);
  };


  Envelope.prototype.hold = function (time) {
     if(this.attackTime > time){
         return;
     }else {
      this.attackTime = time+this.attack;
      this.sustainTime =time+this.attack+this.sustain;
      this.param.linearRampToValueAtTime(this.max, this.attackTime);
      this.param.exponentialRampToValueAtTime(this.sustain, this.sustainTime);
     }
  };
  Envelope.prototype.release = function (time) {

      this.sustainTime = Math.max(time, this.sustainTime);

      this.param.setTargetAtTime(this.min, this.sustainTime+this.decay, this.releaseTimeConstant);
      
      this.attackTime = null;
  };


  Envelope.defaultPackage=function(context) {
      var buffer = context.createBuffer(1, 128, context.sampleRate);
      var p = buffer.getChannelData(0);

      for (var i = 0; i < 128; ++i)
          p[i] = 1;

      var source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.start(0);

      return source;
  };
  Envelope.ControlSignal = function (context, unitySource, initialValue) {
      this.output = context.createGain();
      this.output.gain.value = initialValue;
      unitySource.connect(this.output);
  };


  // function etst() {
  //     var gain = ctx.createGain(1);

  //     var note = new Envelope(2, 5, 2, 3, 4, 2, gain.gain);

  //     var context = ctx;
  //     var ampEnvelopeGain = context.createGain();

  //     var ampAttack = 0.020;
  //     var ampDecay = 0.300;
  //     var ampSustain = 85;
  //     var ampRelease = 0.250;

  //     var amplop = new Envelope(ampAttack, ampDecay, ampSustain, ampRelease, ampEnvelopeGain);

  //     var gainNode = context.createGain();
  //     gainNode.gain.value = 0.25 * 1;

  //     var filter = context.createBiquadFilter();
  //     filter.Q.value = 0;
  //     filter.frequency.value = 0;
  //     filter.connect(gainNode);

  //     gainNode.connect(amplop);

  //     var lfo = context.createOscillator();
  //     lfo.frequency.value = 30;
  //     lfo.type = "triangle";

  //     var lfoDepth = context.createGain();
  //     lfoDepth.gain.value = LFODEPTH;


  //     var velEnvAttack = Math.pow(gain, 0.75);
  //     var filterSustainCents = velEnvAttack * filterEnvAmount * 0.01 * filterSustain;
  //     var minFilterFrequency = 40;
  //     var maxFilterFrequency = minFilterFrequency * Math.pow(2, velEnvAttack * filterEnvAmount / 1200);
  //     var sustainFrequency = minFilterFrequency * Math.pow(2, filterSustainCents / 1200);


  //     var filterEnvelope1 = new Envelope(filterAttack, filterDecay, sustainFrequency, filterRelease, minFilterFrequency, maxFilterFrequency, filter.frequency);


  // }

  window.loadBuffer = function (url) {
      return new Promise((resolve, reject) => {
          var ctx = window.g_audioCtx;
          const xhr = new XMLHttpRequest();
          xhr.open("get", url, true);
          xhr.responseType = "arraybuffer";
          xhr.setRequestHeader("Range", "Bytes:0-");

          xhr.onreadystatechange = function () {
              if (xhr.readyState > 2) {
                  // process newData
                  if (xhr.response !== null) {
                      ctx.decodeAudioData(xhr.response, function (processed) {
                          var source = ctx.createBufferSourceNode();
                          source.buffer = processed;
                      });
                  }
              }
          };
      });
  };

  window.parseString = function(str){
     return  (str.substring(1)||"").split("&").map(arg=>arg.split("=")).reduce((params, kv) => {
          params[kv[0]]=kv[1];
          return params;
      }, {});
  };


  window.get_db = function (ref) {
      if (!window.db) {
          firebase.initializeApp(firebaseConfig);
          window.db = firebase.database();
      }
      if (ref) return window.db.ref(ref);
      else return window.db;
  };
  window.db_presense = function (userId) {
      get_db("channel/" + userId).set({
          id: userId,
          online: true,
          liveSince: new Date().toDateString(),
      });
      window.onunload = function () {
          get_db("channel/" + userId).update({
              online: false,
              offlineAt: new Date(),
          });
      };
  };
  window.hashParams = function () {
      var hash = window.location.hash.substring(1);
      var params = {};
      hash.split("&").map((hk) => {
          let temp = hk.split("=");
          params[temp[0]] = temp[1];
      });
      return params;
  };
  window.toDecibel = function (powerLevel) {
      return 10 * Math.log10(powerLevel);
  };
  window.$ = function (str) {
      var t = document.getElementById(str);
      if (t !== null && typeof t !== "undefined") return document.getElementById(str);
      return document.querySelector(str);
  };
  HTMLElement.prototype.appendstr = function (string) {
      let node = document.createRange().createContextualFragment(string);

      this.appendChild(node);
  };
  async function chord(url, params) {
      const {min, max, attack, decay, sustain, release} = Object.assign({
          min: 0,
          max: 0.5,
          attack: 0.15,
          decay: 0.21,
          sustain: 0.21,
          release: 0.01,
          ...params,
      });
      var str = await fetch(url).then((resp) => resp.text());
      var json = await JSON.parse(str);
      var osc = g_audioCtx.createOscillator();
      osc.setPeriodicWave(g_audioCtx.createPeriodicWave(json.real, json.imag));
      const keys = "asdfghj".split("");
      const notes = "261.63, 293.66 , 329.63, 349.23, 392.00, 440.00, 493.88".split(", ");
      var masterGain = g_audioCtx.createGain();
      masterGain.gain.setValueAtTime(1, g_audioCtx.currentTime);

      var adsrs = [];
      var ctx = g_audioCtx;
      var waveform = g_audioCtx.createPeriodicWave(json.real, json.imag);

      function createKey(i) {
          var osc1 = ctx.createOscillator();
          osc1.frequency.value = notes[i];
          osc1.type = "sine";

          var osc2 = ctx.createOscillator();
          osc2.frequency.value = notes[i] * 2;
          osc2.type = "sawtooth";

          var gain = ctx.createGain();
          gain.gain.value = 0;

          osc1.setPeriodicWave(waveform);
          var gainEnvelope = new Envelope(min, max, attack, decay, sustain, release, gain.gain);
          adsrs[i] = gainEnvelope;
          osc1.connect(gain);
          gain.connect(masterGain);
          osc1.start(0);
          return gainEnvelope;
      }

      var lastkeydown = {};

      window.addEventListener("keydown", function (e) {
          var i = keys.indexOf(e.key);

          if (i > -1) {
              if (!adsrs[i]) {
                  adsrs[i] = createKey(i);
              }
              var env = adsrs[i];

              if (e.repeat) {
                  env.hold(ctx.currentTime);
              } else {
                  env.trigger(ctx.currentTime);
              }
              lastkeydown[e.key] = ctx.currentTime;
          }
      });

      window.addEventListener("keyup", function (e) {
          if (keys.indexOf(e.key) > -1) {
              var env = adsrs[keys.indexOf(e.key)];
              env.release(ctx.currentTime);
          }
      });

      return masterGain;
  }

  HTMLElement.prototype.wrap = function (parent_tag) {
      let p = document.createElement(parent_tag);
      p.appendChild(this);
      return p;
  };

  function slider(container, options) {
      var params = options || {};
      var input = document.createElement("input");
      input.min =
          (params.min !== null && params.min) || (params.prop && params.prop.minValue) || "-12";
      input.max =
          (params.max !== null && params.max) || (params.prop && params.prop.maxValue) || "12";
      input.type = params.type || "range";
      input.defaultValue = (params.prop && params.prop.value.toString()) || params.value;
      input.step = params.step || "0.1";
      var label = document.createElement("span");

      if (input.type == "range") {
          label.innerHTML =
              params.label || (params.prop && params.prop.value.toString()) || params.value;
      } else {
          input.size = "10";
      }
      if (options.oninput) {
          input.oninput = options.oninput;
      } else {
          input.oninput = (e) => {
              params.prop.setValueAtTime(e.target.value, 0);
              label.innerHTML = e.target.value;
          };
      }
      if (options.eventEmitter) {
          options.eventEmitter();
      }
      var contain = document.createElement(params.wrapper || "td");
      contain.style.position = "relative";
      label.style.minWidth = "4em";
      if (params.name) {
          contain.append(el("span", params.name));
      }
      if (params.className) {
          input.className = params.className;
      }
      contain.append(input);
      contain.append(label);

      if (!container) {
          return contain;
      } else container.append(contain);
      return input;
  }
  function el(tag, innerHTML) {
      var t = document.createElement(tag);
      t.innerHTML = innerHTML;
      return t;
  }

  function selector(container, params) {
      var input = document.createElement("select");

      input.value = params.prop;

      for (const option of params.options) {
          var elem = document.createElement("option");
          elem.innerHTML = option;
          elem.value = option;
          if (params.prop && params.prop === option) {
              elem.selected = "selected";
          }
          input.appendChild(elem);
      }
      container.append(input.wrap("td"));
  }

  window.timeseries_static = function (params) {
      var params = Object.assign({sampleSize: 1024, width: 1222, height: 255}, params);
      const {elemId, sampleSize, width, height, analyzer} = params;
      const HEIGHT = height;
      const WIDTH = width;
      var canvas = document.getElementById(elemId);
      const canvasCtx = canvas.getContext("2d");
      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);

      canvasCtx.lineWidth = 1;
      canvasCtx.strokeStyle = "rgb(122, 122, 122)";
      var dataArray = new Uint8Array(analyzer.fftSize);
      var convertY = (y) => height / 2 - (y - 127) / 2;

      canvasCtx.fillStyle = "gray";
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.beginPath();
      canvasCtx.moveTo(0, convertY(0));
      var t = 0;
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "rgb(0, 0, 0)";
      var x = 0;
      function draw() {
          analyzer.getByteTimeDomainData(dataArray);
          var bufferLength = dataArray.length;

          canvasCtx.beginPath();

          // console.log(dataArray);

          for (var i = 0; i < bufferLength; i++) {
              var y = dataArray[i];
              if (y - 127 < 4) continue;
              x = ((t * 40) / bufferLength) % width;
              t++;
              if (t > 11 && x == 0) {
                  canvasCtx.stroke();
                  canvasCtx.beginPath();
                  canvasCtx.moveTo(x, convertY(y));
              } else {
                  canvasCtx.lineTo(x, convertY(y));
              }
          }
          canvasCtx.stroke();
          requestAnimationFrame(draw);
      }
      draw();
  };

  async function Mixer (ctx, containerId) {
    var ctx = ctx;
    const audio1 = document.querySelector("audio#audio1");

    var inputs = new Array(6).fill(null);
    var channelQueues = new Array(6).fill(new Array());
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
      }else if(deviceId=='chord'); else {
        var source = ctx.createBufferSource();
        inputs[index] = source;
        return loadURL(url);
      }

      function loadURL(url) {
        nowPlayingLabels[index].innerHTML = 'loading '+url;
        const xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.responseType = 'arraybuffer';
        xhr.setRequestHeader("Range", "Bytes:0-");
        xhr.onprogress = (e)=>{
          log(e.progress);
        };
        xhr.onreadystatechange = function () {
          nowPlayingLabels[index].innerHTML="ready state "+xhr.readyState;

          if (xhr.readyState > 2) {
            if (xhr.response !== null) {
              ctx.decodeAudioData(xhr.response, function (processed) {
                source.buffer = processed;
                source.connect(controls[index]);
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
            };
          }
        };
        xhr.send();
    }
      return source;
    };
    var audioPlayer;
    
    const add_remote_stream = function (stream,i){
      inputs[i] = stream;

      inputs[i].connect(controls[i]).connect(masterGain);
      nowPlayingLabels[i].innerHTML = 'rtc stream';
    };

    const add_audio_tag = function (tagId, i) {
      audioPlayer = document.querySelector('audio#' + tagId);
      if (!audioPlayer) return false;
      var source = ctx.createMediaElementSource(audioPlayer);
      inputs[i] = source;
      inputs[i].connect(controls[i]).connect(masterGain);
      audioPlayer.oncanplay = function () {
        audioPlayer.play();
        // this.[i].play();
      };

      return source;
    };

    var outputNode = masterGain;

    function connect(node) { this.masterGain.connect(node); }  var cp = document.getElementById(containerId);

    ['YT_SEARCH', 'RTC', 'Microphone', 'notes.csv', 'waves.csv', 'songs.csv'].forEach(async (indexfile, index) => {
      var container = document.createElement("div");
      container.className='text-white bg-secondary mb-2';
      var title = document.createElement("div");
      title.innerText=indexfile;
      var panel = document.createElement("div");
      container.append(title);
      container.append(panel);
      if (indexfile == 'YT_SEARCH') {
        var audio1 = document.querySelector("audio#audio1");
        panel.append(audio1);
      } else if(indexfile== 'RTC'){
        var videoRtc = document.querySelector("video#rtc");
        var source = ctx.createMediaElementSource(videoRtc);
        inputs[index] = source;
        inputs[index].connect(controls[index]).connect(masterGain);
        videoRtc.oncanplay = function () {
          videoRtc.play();
        };
        panel.appendChild(videoRtc);

    }else if (indexfile == 'Microphone') {
        var select = document.createElement("select");
        select.setAttribute("tabindex", index);
        select.setAttribute("data-userMedia", "audio");
        navigator.mediaDevices && navigator.mediaDevices.enumerateDevices().then(function (devices) {
          select.innerHTML = devices.filter(device => device.kind == 'audioinput').map(function (device) {
            return `<option value='${device.deviceId}'>${device.label}</option>`
          }).join("");
        }).catch(function (err) { select.innerHTML = err.message; });
      } else if (indexfile === 'waves.csv') {
        const song_db = await fetch("./samples/" + indexfile+"?t="+ctx.currentTime).then(res => res.text()).then(text => text.split("\n"));
        var select = document.createElement("form");
        var select = document.createElement("select");
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
          loadURL();
        }));
      } else if (indexfile === 'notes.csv') {
        const song_db = await fetch("./samples/" + indexfile).then(res => res.text()).then(text => text.split("\n"));
        var select = document.createElement("div");


        select.innerHTML = "<div class='btn-toolbar'>"+
        song_db.filter(t => t.trim() !== "").map((n, j) => {
          var url = "samples/"+n;
          var name = n.replace(".mp3","");
          return `<button class="btn btn-secondary" value='${url}'>${name}</button>` ;
        }).join("") + "</div>";

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

      var apply = document.createElement("button");
      apply.innerHTML = "go";
      var nowPlayingLabel = document.createElement("label");

      var stop = document.createElement("button");
      stop.innerHTML = "stop";
      if (select){
         panel.appendChild(select);
         select.querySelectorAll("button").forEach(button => button.addEventListener("click", (e) => {
          var url = e.target.value;
          loadURLTo(url, index);
        }));
    
        select.addEventListener("input", e=>{
          if(e.target.type !=='text'){
            loadURL();
          }
        });
      }
      panel.appendChild(nowPlayingLabel.wrap("div"));
      slider(panel, {prop: controls[index].gain, step:"0.01",  max:"2", min:"0",wrapper:"span"});
      container.append(panel);
      cp.appendChild(container);
      panel.appendChild(apply);
      panel.appendChild(stop);
      stop.onclick = (e) => {
        if( inputs[index] instanceof MediaStreamAudioSourceNode ){
          inputs[index].disconnect(); 
        }else {
          inputs[index].stop();
        }
    //  ]    inputs[index] instanceof MediaStreamAudioSourceNode  ?  inputs[index].disconnect() : inputs[index].stop();
        inputs[index].disconnect();
        inputs[index] = null;
        inputs[index] instanceof MediaStreamAudioSourceNode  ?  inputs[index].disconnect() : inputs[index].stop();
      };

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
          audioPlayer.oncanplay = function (evt) { audioPlayer.play(); };
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

    });
    return {
      inputs, outputNode, controls,
      connect, loadURLTo,
      add_audio_tag,add_remote_stream
    }
  }

  class NoiseGate {
    /**
     * @constructor
     * @param {BaseAudioContext} context The audio context
     * @param {Object} options Parameters for the noise gate.
     * @param {Number} options.numberOfChannels The number of input and output
     *                                  channels. The default value is one, and
     *                                  the implementation supports
     *                                  a maximum of two channels.
     * @param {Number} options.attack Seconds for gate to fully close. The default
     *                                is zero.
     * @param {Number} options.release Seconds for gate to fully open. The default
     *                                 is zero.
     * @param {Number} options.bufferSize The size of an onaudioprocess window.
     *                                    The default lets the script processor
     *                                    decide.
     * @param {Number} options.timeConstant Seconds for envelope follower's
     *                                      smoothing filter delay. The
     *                                      default has been set experimentally to
     *                                      0.0025s.
     * @param {Number} options.threshold Decibel level beneath which sound is
     *                                   muted. The default is -100 dBFS.
     */
    constructor(context, options) {
      if (!(context instanceof BaseAudioContext))
        throw 'Not a valid audio context.';
      if (!options) options = {};

      const numberOfChannels = options.numberOfChannels || 1;
      if (numberOfChannels > 2)
        throw 'The maximum supported number of channels is two.';

      this.context_ = context;
      const bufferSize = options.bufferSize || 0;
      this.attack = options.attack || 0;
      this.release = options.release || 0;

      // The time constant of the filter has been set experimentally to balance
      // roughly delay for high frequency suppression.
      let timeConstant = (typeof options.timeConstant === 'undefined') ?
          0.0025 : options.timeConstant;

      this.threshold = (typeof options.threshold === 'undefined') ?
          -100 : options.threshold;

      // Alpha controls a tradeoff between the smoothness of the
      // envelope and its delay, with a higher value giving more smoothness at
      // the expense of delay and vice versa.
      this.alpha_ = this.getAlphaFromTimeConstant_(
          timeConstant, this.context_.sampleRate);

      this.noiseGateKernel_ = this.context_.createScriptProcessor(
          bufferSize, numberOfChannels, numberOfChannels);
      this.noiseGateKernel_.onaudioprocess = this.onaudioprocess_.bind(this);

      // The noise gate is connected to and from by dummy input and output nodes.
      this.input = new GainNode(this.context_);
      this.output = new GainNode(this.context_);
      this.input.connect(this.noiseGateKernel_).connect(this.output);

      // The previous envelope level, a float representing signal amplitude.
      this.previousLevel_ = 0;

      // The last weight (between 0 and 1) assigned, where 1 means the gate
      // is open and 0 means it is closed and the sample in the output buffer is
      // muted. When attacking, the weight will linearly decrease from 1 to 0, and
      // when releasing the weight linearly increase from 0 to 1.
      this.previousWeight_ = 1.0;
      this.channel_ = new Float32Array(this.noiseGateKernel_.bufferSize);
      this.envelope_ = new Float32Array(this.noiseGateKernel_.bufferSize);
      this.weights_ = new Float32Array(this.noiseGateKernel_.bufferSize);

      var channel = new MessageChannel();
      this.port = channel.port1;
      this.port.onmessage=(msg)=>{
          this.postMessage("pong");
      };
      this.postMessage = (msg)=> channel.port2.postMessage(msg);
    }

    /**
     * Control the dynamic range of input based on specified threshold.
     * @param {AudioProcessingEvent} event An Event object containing
     *                                     input and output buffers.
     */
    onaudioprocess_(event) {
      let inputBuffer = event.inputBuffer;
      let channel0 = inputBuffer.getChannelData(0);

      // Stereo input is downmixed to mono input via averaging.
      if (inputBuffer.numberOfChannels === 2) {
        let channel1 = inputBuffer.getChannelData(1);
        for (let i = 0; i < channel1.length; i++) {
          this.channel_[i] = (channel0[i] + channel1[i]) / 2;
        }
      } else {
        this.channel_ = channel0;
      }

      let envelope = this.detectLevel_(this.channel_);
      let weights = this.computeWeights_(envelope);

      for (let i = 0; i < inputBuffer.numberOfChannels; i++) {
        let input = inputBuffer.getChannelData(i);
        let output = event.outputBuffer.getChannelData(i);

        for (let j = 0; j < input.length; j++) {
          output[j] = weights[j] * input[j];
        }
      }
    }

    /**
     * Compute an envelope follower for the signal.
     * @param {Float32Array} channelData Input channel data.
     * @return {Float32Array} The level of the signal.
     */
    detectLevel_(channelData) {
      // The signal level is determined by filtering the square of the signal
      // with exponential smoothing. See
      // http://www.aes.org/e-lib/browse.cfm?elib=16354 for details.
      this.envelope_[0] = this.alpha_ * this.previousLevel_ +
          (1 - this.alpha_) * Math.pow(channelData[0], 2);

      for (let j = 1; j < channelData.length; j++) {
        this.envelope_[j] = this.alpha_ * this.envelope_[j - 1] +
            (1 - this.alpha_) * Math.pow(channelData[j], 2);
      }
      this.previousLevel_ = this.envelope_[this.envelope_.length - 1];
      
     return this.envelope_;
    }

    /**
     * Computes an array of weights which determines what samples are silenced.
     * @param {Float32Array} envelope The output from envelope follower.
     * @return {Float32Array} weights Numbers in the range 0 to 1 set in
     *                                accordance with the threshold, the envelope,
     *                                and attack and release.
     */
    computeWeights_(envelope) {
      // When attack or release are 0, the weight changes between 0 and 1
      // in one step.
      let attackSteps = 1;
      let releaseSteps = 1;
      let attackLossPerStep = 1;
      let releaseGainPerStep = 1;

      // TODO: Replace this weights-based approach for enabling attack/release
      // parameters with the method described on page 22 in
      // "Signal Processing Techniques for Digital Audio Effects".

      // When attack or release are > 0, the associated weight changes between 0
      // and 1 in the number of steps corresponding to the millisecond attack
      // or release time parameters.
      if (this.attack > 0) {
        attackSteps = Math.ceil(this.context_.sampleRate * this.attack);
        attackLossPerStep = 1 / attackSteps;
      }
      if (this.release > 0) {
        releaseSteps = Math.ceil(this.context_.sampleRate * this.release);
        releaseGainPerStep = 1 / releaseSteps;
      }

      // Compute an array of weights between 0 and 1 which will be multiplied with
      // the channel depending on if the noise gate is open, attacking, releasing,
      // or closed.
      for (let i = 0; i < envelope.length; i++) {
        // For sine waves, the envelope eventually reaches an average power of
        // a^2 / 2. Sine waves are therefore scaled back to the original
        // amplitude, but other waveforms or constant sources can only be
        // approximated.
        const scaledEnvelopeValue = NoiseGate.toDecibel(2 * envelope[i]);
        if (scaledEnvelopeValue < this.threshold) {
          const weight = this.previousWeight_ - attackLossPerStep;
          this.weights_[i] = Math.max(weight, 0);
        }
        else {
          const weight = this.previousWeight_ + releaseGainPerStep;
          this.weights_[i] = Math.min(weight, 1);
        }
        this.previousWeight_ = this.weights_[i];
      }
      return this.weights_;
    }

    /**
     * Computes the filter coefficent for the envelope filter.
     * @param  {Number} timeConstant The time in seconds for filter to reach
     *                               1 - 1/e of its value given a transition from
     *                               0 to 1.
     * @param  {Number} sampleRate The number of samples per second.
     * @return {Number} Coefficient governing envelope response.
     */
    getAlphaFromTimeConstant_(timeConstant, sampleRate) {
      return Math.exp(-1 / (sampleRate * timeConstant));
    }

    /**
     * Converts number into decibel measure.
     * @param  {Number} powerLevel The power level of the signal.
     * @return {Number} The dBFS of the power level.
     */
    static toDecibel(powerLevel) {
      return 10 * Math.log10(powerLevel);
    }
  }

  const HZ_LIST = new Float32Array([31.25, 62.5, 125, 250, 500, 1000, 2000]);
  const DEFAULT_PRESET_GAINS =
  {
          '31.25': 0.375,
          '62.5': 0.375,
          '125': 0.375,
          '250': 0.375,
          '500': 0.375,
          '1000': 0.375,
          '2000': 0.375,
          '4000': 0.6,
          '8000': 0.5,
          '16000': 0,

  };

  const EQ_PRESETS = {
    "conversation": { preamp: "0.375",   gains: ["0", "0", "0", "0","0", "0","0", "0","0", "0","0", "0"]},

    "[Classical]": { preamp: "0.375",   gains: ["0.375", "0.375", "0.375", "0.375", "0.375", "0.375", "-4.5", "-4.5", "-4.5"] },
    "[Club]": { preamp: "0.375",        gains: ["0.375", "0.375", "2.25", "3.75", "3.75", "3.75", "2.25", "0.375", "0.375"] },
    "[Dance]": { preamp: "0.375",       gains: ["6", "4.5", "1.5", "0", "0", "-3.75", "-4.5", "-4.5", "0"] },
    "[Flat]": { preamp: "0.375",        gains: ["0.375", "0.375", "0.375", "0.375", "0.375", "0.375", "0.375", "0.375", "0.375"] },
    "[Live]": { preamp: "0.375",        gains: ["-3", "0.375", "2.625", "3.375", "3.75", "3.75", "2.625", "1.875", "1.875"] },
    "[HEADPHONEs]": {  preamp: "0.375", gains: ["3", "6.75", "3.375", "-2.25", "-1.5", "1.125", "3", "6", "7.875"] },
    "[Rock]": { preamp: "0.375",        gains: ["4.875", "3", "-3.375", "-4.875", "-2.25", "2.625", "5.625", "6.75", "6.75"] },
    "[Pop]": { preamp: "0.375",         gains: ["-1.125", "3", "4.5", "4.875", "3.375", "-0.75", "-1.5", "-1.5", "-1.125"] },
    "[Full Bass]": { preamp: "0.375",   gains: ["6", "6", "6", "3.75", "1.125", "-2.625", "-5.25", "-6.375", "-6.75"] },
    "[Full Treble]": { preamp: "0.375", gains: ["-6", "-6", "-6", "-2.625", "1.875", "6.75", "9.75", "9.75", "9.75"] },
    "[Soft]": { preamp: "0.375",        gains: ["3", "1.125", "-0.75", "-1.5", "-0.75", "2.625", "5.25", "6", "6.75"] },
    "[Party]": { preamp: "0.375",       gains: ["4.5", "4.5", "0.375", "0.375", "0.375", "0.375", "0.375", "0.375", "4.5"] },
    "[Ska]": { preamp: "0.375",         gains: ["-1.5", "-3", "-2.625", "-0.375", "2.625", "3.75", "5.625", "6", "6.75"] },
    "[Soft Rock]": { preamp: "0.375",   gains: ["2.625", "2.625", "1.5", "-0.375", "-2.625", "-3.375", "-2.25", "-0.375", "1.875"] },
    "[Large Hall]": { preamp: "0.375",  gains: ["6.375", "6.375", "3.75", "3.75", "0.375", "-3", "-3", "-3", "0.375"] },
    "[Reggae]": { preamp: "0.375",      gains: ["0.375", "0.375", "-0.375", "-3.75", "0.375", "4.125", "4.125", "0.375", "0.375"] },
    "[Techno]": { preamp: "0.375",      gains: ["4.875", "3.75", "0.375", "-3.375", "-3", "0.375", "4.875", "6", "6"] }
  };

  function menu(){
    return Object.keys(EQ_PRESETS).map(name=>`<option name='${name}'>${name}</option>`).join("");
  }


  function presetGains(name) {
    return EQ_PRESETS[name].gains;
  }


  var Presets = {
    menu, presetGains, EQ_PRESETS
  };

  class EventEmitter {
    constructor() {
      this.events = {};
    }

    emit(eventName, data) {
      const event = this.events[eventName];
      if (event) {
        event.forEach((fn) => {
          fn.call(null, data);
        });
      }
    }

    subscribe(eventName, fn) {
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }

      this.events[eventName].push(fn);
      return () => {
        this.events[eventName] = this.events[eventName].filter((eventFn) => fn !== eventFn);
      };
    }

    once(eventName, fn) {}
  }
  EventEmitter.prototype.getInstance = function () {
    return;
  };

  function split_band(ctx, hz_list) {
    var emt = new EventEmitter();
    var input = ctx.createGain();
    input.gain.setValueAtTime(1.2, ctx.currentTime+0.1);
   
    var output = ctx.createGain();
    output.gain.setValueAtTime(1.2, ctx.currentTime+0.1);
    window.gctx = window.g_audioCtx;
    var bands = [];
    // bands.push(new Band(input, output,null,null));
    var mode = $("#mode_parallel") && $("#mode_parallel").checked===true || "series";
    var analyzer = ctx.createAnalyser();
  	if(mode=='series'){
      var c = output;

      for (let index = hz_list.length; index>=0; index--){
        const hz = hz_list[index];
        if(index==hz_list.length-1){
           bands.push(new BiquadFilterNode(ctx,  {type:"highshelf", frequency:hz, gain:1, Q:1, detune:0}));
        }
        else if(index==0){
          bands.push(new BiquadFilterNode(ctx,{type:"lowshelf", frequency:hz, gain:0, Q:1, detune:0}));
        }else {
          bands.push(new BiquadFilterNode(ctx,{type:"peaking", frequency:hz, gain:0, Q:1, detune:0}));
        } 
        
        bands[bands.length-1].connect(c);
        c = bands[bands.length-1];
      }
      input.connect(c);
    }else {
      input.connect(output);
      hz_list.forEach((hz,index)=>{
        if(index==0){
          bands.push(new Band(input, output, null, hz));
        }else {
          bands.push(new Band(input, output, hz_list[index-1], hz));
        }
      });
      bands.push(new Band(input,output, hz_list[hz_list.length-1], null));
    }



    function UI_Canvas(){

      const width = 690;
      const height = 320;
    
      const marginleftright = 10;
      const hz_20_mark = 10;
      const hz_20k_mark = 683;
      const width_per_octave  = [hz_20k_mark - hz_20_mark] / 4;
      const width_within_octave = [40, 28, 23, 18, 14, 14, 10, 19];  /* dogma */

      
      var canvas = document.createElement("canvas");
      canvas.setAttribute('id', "c2_freq");
      canvas.setAttribute("width", width + 2*marginleftright);
      canvas.setAttribute("height", height);
    
      const bg_color = 'rgb(33,33,35)';
      const cvt = canvas.getContext('2d');
      cvt.fillStyle = bg_color;
      cvt.fillRect(10, 0, width,height );
      cvt.strokeStyle = 'rgb(255, 255,255)';
      cvt.strokeWidth = '2px';
      for(let x = hz_20_mark; x <= hz_20k_mark; x+= width_per_octave){
        cvt.strokeWidth = '2px';
        cvt.strokeStyle = 'rgb(255, 255,255)';
    
        cvt.beginPath();
        cvt.moveTo(x,22);
        cvt.lineTo(x,height);
        cvt.stroke();
        var x_ = x;
        for(let i = 1; i<7; i++){
          cvt.strokeStyle = 'rgb(66, 66,66)';
    
          cvt.strokeWidth = '1px';
          var x_ = x_ + width_within_octave[i];
          cvt.beginPath();
          cvt.moveTo(x_, 22);
          cvt.lineTo(x_, height);
          cvt.stroke();
        }
        const noctaves = 11;
        for (var octave = 0; octave <= noctaves; octave++) {
          x = octave * width / noctaves;
    
          cvt.strokeStyle = 'rgb(255, 255,255)';
          cvt.moveTo(x, 30);
          cvt.lineTo(x, height);
          cvt.stroke();
    
          var f = 0.5 * gctx.sampleRate * Math.pow(2.0, octave - noctaves);
          cvt.textAlign = "center";
          cvt.strokeText(f.toFixed(0) + "Hz", x, 20);
        }
      }
    
      return canvas;
    
    }
    var lastProbe;
    function probe(index){
     analyzer.disconnect();
     if(lastProbe) lastProbe.disconnect(analyzer);

     lastProbe = bands[index];
     bands[index].connect(analyzer);

      histogram2("band_freq_out",analyzer, bands[index].frequency.value);
    }
    function UI_EQ(bandpassFilterNode,compressor){
      // <div> <button id='reset'>reset</button></div> <select id=preset_options></select>
      var cp =  document.createElement("div");

      var presetOptions= document.createElement("select");
      if(bandpassFilterNode && presetOptions){
        presetOptions.innerHTML = Presets.menu();
        presetOptions.oninput = function (e) {
          var name = e.target.value;
          var gains = Presets.presetGains(name);
          bandpassFilterNode.port.postMessage({
            gainUpdates: gains.map((gain, index) => {
              return { index: index, value: gain }
            })
          });
        };
        cp.appendChild(presetOptions);
      }
      cp.appendstr("<input type=checkbox id=mode_parallel>paralell mode</input>");
      const table = document.createElement("table");
      table.className='text-white';
      table.setAttribute("border","1");
      const header = document.createElement("tr");
      header.innerHTML=`<tr><td>hz</td><td>gain</td>
    <td>type</td><td>gain</td> <td>rolloff (Q)</td><td>detune</td>
    <td>opts</td></tr>`;
      table.appendChild(header);
      
      var gvctrls =  document.createElement("div");
      slider(gvctrls, {prop: input.gain, min:"0", max: "4", name: "preamp:"});
      slider(gvctrls, {prop: compressor.threshold, min:"-70", max:"0", name:"compressor: "});
      bands.forEach( (band,index)=>{
        const row = document.createElement("tr");
        row.innerHTML+=`<td>${band.frequency.value}</td>`;
          
          slider(row, {className:'bandpass', value: Object.values(DEFAULT_PRESET_GAINS)[index], min:"-12",max:"12",oninput:function(e){
          bandpassFilterNode.port.postMessage({
            gainUpdate:{ index: index, value: e.target.value }
          });
        }});
        var emitter = ()=>{ emt.emit("filterChanged", input);};
        // slider(row,  {prop: band.compressor.threshold, min:-100, max: 0, step:1, index:index});  
        // row.innerHTML +="<td><label>"+ band.mainFilter.type+"</label></td>"
        selector(row, {prop: band.type, options: ["allpass" , "bandpass" , "highpass" , "highshelf" , "lowpass" , "lowshelf" , "notch" , "peaking"]});
        slider(row, {prop: band.gain, min:-12, max: 12, step:0.1, index:index,eventEmitter: emitter}); 
        slider(row, {prop: band.Q, min:0.01, max:22, step:0.1, index:index, eventEmitter:emitter}); 
        slider(row, {prop: band.detune, min:0.0, max:0.5, step:"0.01", index:index, eventEmitt:emitter}); 
        var button = document.createElement("button");
        button.innerHTML='connect';
        button.onclick = (e)=>{probe(index);};
        row.appendChild(button.wrap("td"));  
        
        table.appendChild(row);
      });

      cp.appendChild(gvctrls);
      cp.append(table);
     //cp.appendChild($("#noisegate"));
      
      return cp;
    }
    return {
      bands, UI_Canvas, UI_EQ, input, output
    };
  }


  function histogram2(elemId, analyzer, fc){
    var bins = analyzer.frequencyBinCount;
    var zoomScale=1;
    var canvas = document.getElementById(elemId);
    const width = 690;
    const height = 320;

    const marginleftright = 10;

    canvas.setAttribute("width", width + 2*marginleftright);
    canvas.setAttribute("height", height);

    const bg_color = 'rgb(33,33,35)';
    const cvt = canvas.getContext('2d');
   
    cvt.clearRect(0, 0,width,height);

    cvt.fillStyle = bg_color;
    cvt.fillRect(0, 0, width,height );
    cvt.strokeStyle = 'rgb(255, 255,255)';
    cvt.strokeWidth = '2px';

    var dataArray = new Uint8Array(analyzer.fftSize);

    const drawTick = function(x,f , meta){
          cvt.strokeStyle = 'rgb(255, 255,255)';
          cvt.moveTo(x, 30);
          cvt.lineTo(x, height);
          cvt.stroke();

          cvt.textAlign = "center";
          cvt.strokeText(meta, width-20, 20);
    };      
    const bin_number_to_freq = (i)=> 0.5 * gctx.sampleRate * i/analyzer.frequencyBinCount;
    if(window.g_request_timer) cancelAnimationFrame(window.g_request_timer);
  	  function drawBars(){
        window.g_request_timer = requestAnimationFrame(drawBars);

        analyzer.getByteFrequencyData(dataArray);

        cvt.clearRect(0,0,width,height);
        var x=0; 
        var hz_mark_index=0;
        var linerBarWidth = width/bins;

        for (var i = 0; i < bins; i++) {
          
          var f =bin_number_to_freq(i);
          if( f >= HZ_LIST[hz_mark_index]){
            hz_mark_index++;
            if(hz_mark_index >= HZ_LIST.length) break;
            if(hz_mark_index>3) drawTick(x,  HZ_LIST[hz_mark_index], '');
          }


          var barWidth = hz_mark_index < 2 ? 20*linerBarWidth : (hz_mark_index <  7 ? 5 * linerBarWidth : linerBarWidth/2);
          if( fc && Math.abs(f - fc) < 500) barWidth = 20*linerBarWidth;
          var barHeight = dataArray[i] * zoomScale;

          cvt.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';

          cvt.fillRect(x,height-barHeight/2-25, barWidth, (barHeight/2));
          x += barWidth;  
                    
        }
    }

    drawBars();
  }

  var AnalyzerView = function(audioNode, params){
    const _configs = {};
    const configs =  params || _configs;

    var fft = audioNode.context.createAnalyser();
    fft.fftSize = configs.fft || 2048;
    const bins = fft.fftSize;

    const ctx = fft.context;
    var zoomScale = 1;
    audioNode.connect(fft);
    var cummulativeFFT = new Uint8Array(fft.fftSize).fill(0);
    var hz_per_bin = ctx.sampleRate / bins;
    

    function zoomIn(){
      zoomScale += 0.1;
    }
    function zoomOut(){
      zoomScale -= 0.1;
    }
    if($("#zoomin")) $("#zoomin").onclick=zoomIn;
    if($("#zoomout")) $("#zoomout").onclick=zoomOut;

    function fft_in_hz_list(){
      var dataArray = new Uint8Array(bins);
      var hz_index=0;
      var hz_histram = new Uint8Array(hz_index.length).fill(0);
      fft.getByteFrequencyData(dataArray);
      for(let i = 0; i < bins; i++){
        
        if( i*hz_per_bin > HZ_LIST[hz_index]){
           hz_histram[hz_index++] = dataArray[i];
        }else {
           hz_histram[hz_index] = dataArray[i];
        }
      }
      return hz_histram;    
    }

    return {
      cummulativeFFT: cummulativeFFT,
      fft_in_hz_list: fft_in_hz_list, 
      analyzer:fft,
      zoomIn: zoomIn,
      zoomOut: zoomOut,
      pan: function(dir){
      },
      fftU8: ()=>{
        var data = new Uint8Array(fft.fftSize);
        fft.getByteFrequencyData(data);
        return data;
      },
      rms: function(){
        var sum = 0;

        return fftU8().reduce(d=>sum+=d, 0);
      },
      timeseries: function(elemId, sampleSize=1024, width=1222, height=255){
        fft.fftSize = sampleSize;
        this.timeseries2({elemId, sampleSize, width, height, analyzer:fft});
      },
      timeseries2: function(params){
        var params = Object.assign({sampleSize:1024, width:1111, height:255}, params);
        const {elemId, sampleSize, width, height, analyzer} = params;
        const HEIGHT = height;
        const WIDTH = width;
        var canvas = document.getElementById(elemId);
        const canvasCtx = canvas.getContext('2d');
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        canvas.fillStyle='rbg(0,2,2)';
        canvasCtx.lineWidth = 1;
        canvasCtx.strokeStyle = 'white';
        var dataArray = new Uint8Array(analyzer.fftSize);
        var convertY = y => y/2 + height/4;

        canvasCtx.fillRect(0,0,WIDTH,HEIGHT);

        canvasCtx.beginPath();
        canvasCtx.moveTo(0, convertY(0));
        var t = 0; 
        canvasCtx.lineWidth = 1;
        var x  = 0;
        canvas.onwheel = function(e) {
          e.preventDefault();
          if(e.deltaY<0) ;
        };
        function draw(){
                
           analyzer.getByteTimeDomainData(dataArray);
           var bufferLength = dataArray.length;

           canvasCtx.beginPath();
          var sum=0;

          sum = dataArray.reduce((accumulator, currentValue) => accumulator + currentValue);

          canvasCtx.clearRect(10,20,10,100);
          canvasCtx.fillRect(10,20,10,100);
          canvasCtx.strokeStyle='white';
          canvasCtx.strokeWidth=1;
          canvasCtx.strokeText(`r m s : ${sum/bufferLength}`,10,20,100);
           for (var i = 0; i < bufferLength; i++) {
       
              var y = dataArray[i];
              if( y ==0 ) continue;
                x = t/bufferLength  % width;
                t++;
                if (t > 100 && x ==0) {
                    canvasCtx.clearRect(0,0,width,height);
                    canvasCtx.fillRect(0,0,width,height);
                    canvasCtx.stroke();
                    canvasCtx.beginPath();                  
                    canvasCtx.moveTo(x,convertY(y));
                } else {
                    canvasCtx.lineTo(x,convertY(y));
                }
           }
           canvasCtx.stroke();
           requestAnimationFrame(draw);
        }
        draw();
      },

      histogram_once:  function(elemId, width = 320, height= 200){
        return histogram(elemId, width, height, false);
      },
      histogram: function(elemId, width = 430, height= 200, repeating=true){
        // var fromBin = xshift * zoomScale;
        // var toBin = Math.min(bins, (xshift - bins) * zoomScale);
        // var barWidth = width / (fromBin - toBin);
        // var binsForLabel = 5*(fromBin - toBin)/75
        
        var canvas = document.getElementById(elemId);
        const canvasCtx = canvas.getContext('2d');
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'black';
        canvasCtx.fillStyle = 'white';
        canvasCtx.fillRect(0,0,width, height);
        var dataArray = new Float32Array(fft.fftSize);
        if(!repeating) return dataArray;      
        function drawBars(){
          
            var draw= !($("#showfft") && $("#showfft").checked == false);
  !($("#showcummulative") && $("#showcummulative").checked == false);
            var t = requestAnimationFrame(drawBars);


            fft.getFloatFrequencyData(dataArray);
            
            if(configs.onFftGot) {
              configs.onFftGot(dataArray, fft);
              return;
            }
            var total =0;
            dataArray.reduce(d=> total+=d);
            
            
            for(let i=0; i<dataArray.length; i++){
                cummulativeFFT[i] = cummulativeFFT[i] + dataArray[i];
            }
            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            //
            canvasCtx.clearRect(0, 0, width, height);
            canvasCtx.fillRect(0, 0, width, height);

            var barWidth = (width / (bins/zoomScale)) * 2.5;
            var barHeight;
            var barHeigthCC;
            var x = 0;

            //24000
          // freq =
            canvasCtx.fillText(fft.context.currentTime, 0,0, 20, 10);
            for(var i = 0; i < bins/zoomScale; i++) {
              barWidth = width/bins * 250/(30-i);

              barHeight = dataArray[i] * zoomScale;
              let hue = i/fft.frequencyBinCount * 360;

              barHeigthCC = cummulativeFFT[i];
              canvasCtx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';

              if(draw) canvasCtx.fillRect(x,height-barHeight/2-25,barWidth,(barHeight/2));

              canvasCtx.fillStyle = 'rgb(22, 22,'+(barHeigthCC+44)+')';

             x += barWidth + 1;

              // x += barWidth + 1;
              // value =  dataArray[i];
              // percent = value / 256;
              // height = HEIGHT * percent;
              // offset = HEIGHT - height - 1;
              // barWidth = WIDTH / fft.frequencyBinCount;
              // let hue = i/fft.frequencyBinCount * 360;
              // canvasCtx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
              // this.drawContext.fillRect(i * barWidth, offset, barWidth, height);
            }

            canvasCtx.fillText(zoomScale, 0, height-5);

            x=10;
            var axisIndex=0;
            for(var i = 0; i < bins/zoomScale; i++) {
                        barWidth = width/bins * 250/(30-i);

              barHeight = dataArray[i];
              canvasCtx.fillStyle= 'rgb(233,233,233)';
              canvasCtx.textAlign ='left';
              var f = i/bins  * 24000;
              if(f>HZ_LIST[axisIndex]){
                canvasCtx.fillText(HZ_LIST[axisIndex].toFixed(0)+'', x, height-(axisIndex % 2 ? 15 : 0));
                axisIndex++;
              }

              x += barWidth + 1;
            }   
            canvasCtx.fillText(total.toFixed(3)+'', 10, 10);
        }

        drawBars();
      }
    }
  };

  class BandPassFilterNode extends AudioWorkletNode{
      constructor(ctx,options){
          super(ctx, 'band_pass_lfc_processor', options);
          // this._worker = new AudioWorkletNode(ctx, 'band_pass_lfc_processor');
          this.port.onmessage = e => {
              if(e.data.gainupdates_processed){
                  var inputs =document.querySelectorAll(".bandpass");
                  e.data.gainupdates_processed.forEach((gain,index)=>{
                      inputs[index] && (inputs[index].value = gain);
                  });
              }
              if(e.data.spl_in){
               $("#rx0").innerHTML = "sound in "+e.data.spl_in;
              }

              if(e.data.spl_out){
                  $("#rx1").innerHTML = "volume out" +e.data.spl_out;
                 }
          };
          this.port.onmessageerror = e =>{
              log("msg error "+e.message);
          };
          this.inputs=[];
      }
      setGainAtFreq(gain, freq){
          var index = HZ_LIST.indexOf(freq);
          if(index<0) throw new Error("freq "+freq+" not mapped");
          this.postMessage({
              gainUpdate: {index: index, value: gain}
          });
      }

      setGainsProcessed(gainupdates_processed){
          var index = HZ_LIST.indexOf(freq);
          if(index<0) throw new Error("freq "+freq+" not mapped");
          this.postMessage({
              gainUpdate: {index: index, value: gain}
          });
      }

      defaultGains(){
          return  DEFAULT_PRESET_GAINS;
      }
  }

  // export default function loadBandPassFilters(ctx, containerId){
  //     return new Promise( (resolve, reject)=>{
  //         ctx.audioWorklet.addModule('../band_pass_lfc/processor.js').then(_=>{
  //             var r = new AudioWorkletNode(ctx, 'band_pass_lfc_processor');
  //             r.port.onmessage = e => {
  //                 if(e.data.gainupdates_processed){
  //                     var inputs =document.querySelectorAll(".bandpass");
  //                     e.data.gainupdates_processed.forEach((gain,index)=>{
  //                         inputs[index].value = gain;
  //                     })
  //                 }
  //                 if(e.data.spl_in){
  //                  $("#rx0").innerHTML = e.data.spl_in;
  //                 }

  //                 if(e.data.spl_out){
                      
  //                     $("#rx1").innerHTML = e.data.spl_out;
  //                    }
  //             }
  //             r.port.onmessageerror = e =>{
  //                 log("msg error "+e.message);
  //             }
      

  //             let container = $("#"+containerId);
  //             if(container){
  //                 var r
  //                 HZ_LIST.forEach((hz,index)=>{
  // 					var gain = DEFAULT_PRESET_GAINS[hz+""];

  //                     var input = document.createElement("input");
  // 					input.type='range';
  //                     input.className='bandpass'
  //                     input.min = "-12";
  //                     input.max = "12";
  //                     input.value = ""+gain;
  //                     input.id = "bpi_"+index;
  //                     input.step="0.1"
  // 					input.oninput = (evt)=>{
  // 						r.port.postMessage({
  // 							gainUpdate: {index: index, value: evt.target.value}
  // 						})
  //                     }
  //                     var label = document.createElement("span");
                      
  //                     label.innerHTML =gain;
  //                     input.onchange = (evt)=>label.innerHTML=evt.target.value;
  //                     var contain = document.createElement("div");
  //                     contain.style.position='relative';
  //                     contain.append(input);
  //                     contain.append(label);
  //                     contain.id = "bp_"+index;
  //                     container.append(contain);
                              
  //                 })
  //             }
  //             resolve(r)
  //         }).catch(e=>{
  // 			reject(e);
  // 		})
  //     })
  // }

  const signalServerURL = window.location.hostname == 'localhost' ? "ws://localhost:9091" : "wss://api.grepawk.com/signal";
  const peerRTCConfig = {
      'RTCIceServers': [{ url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stun.fwdnet.net' },
      { url: 'stun:stun.ideasip.com' },
      { url: 'stun:stun.iptel.org' },
      { url: 'stun:stun.rixtelecom.se' },
      { url: 'stun:stun.schlund.de' },
      { url: 'stun:stun.l.google.com:19302' },
      { url: 'stun:stun1.l.google.com:19302' },
      { url: 'stun:stun2.l.google.com:19302' },
      { url: 'stun:stun3.l.google.com:19302' },
      { url: 'stun:stun4.l.google.com:19302' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
          url: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
      },
      {
          url: 'turn:numb.viagenie.ca',
          credential: 'welcome',
          username: 'yisheng.jiang@gmail.com'
      },
      {
          url: 'turn:192.158.29.39:3478?transport=udp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
      },
      {
          url: 'turn:192.158.29.39:3478?transport=tcp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
      }]
  };


  function BroadcasterClient(config) {
      config = config || {};
      config.console = config.console || "console";

      const hostname = config.hostname || signalServerURL;
      let onEvent = config.onEvent || console.log;
      let signalConnection;
      let peerConnections = {};
      let localTracks = [];
      var host_uuid;

      var prepareStream = config.prepareStream || function (peerConnection, arg1, arg2) {
          
      };

      function trackDescriptor(id, track, dimensions) {
          return {
              id: id, track: track, dimensions: dimensions, live: true
          }
      }
      function addTrack(track, dimensions) {
          for (var idx in localTracks) {
              if (localTracks[idx].id === track.id) {
                  localTracks[idx] = trackDescriptor(track.id, track, dimensions);
              }
          }
          localTracks.push(trackDescriptor(track.id, track, dimensions));
      }
      function removeTrack(track) {
          for (var idx in localTracks) {
              if (localTracks[idx].id === track.id) {
                  localTracks[idx].live = false;
              }
          }
      }
      function sendJson(json, to_uuid) {
          if (to_uuid) json[to_uuid] = to_uuid;
          signalConnection.send(JSON.stringify(json));
      }
      function broadcastAudio(channelName, source) {
          startBroadcast(channelName);
          addStream(source);
      }
      function startBroadcast(channelName) {
          signalConnection = new WebSocket(hostname);
          signalConnection.onmessage = (event) => {
              const data = JSON.parse(event.data);
              onEvent(event.data.type || "");
              switch (data.type) {
                  case 'registered':
                      host_uuid = data.host_uuid;
                      break;
                  case 'user_joined':
                      user_join_request(data);
                      break;
                  case 'answer':
                      user_sent_sdp_answser(data);
                      break;
                  case 'candidate':
                      user_sent_peer_ice_candidate(data);
                      break;
                  case 'user_left':
                      break;
                  case 'connected':
                      onEvent("connnected to signal");
              }
          };
          signalConnection.onopen = (e) => {
              sendJson({
                  type: "register_stream",
                  channel: channelName
              });
              onEvent("Stream registered " + channelName);
          };
          signalConnection.onerror = (e) => onEvent("ERROR: signalconnection not connecting", e);
          window.onunload = function (e) {
              signalConnection.close();
          };
      }

      function user_sent_peer_ice_candidate(data) {
          if (!data.client_uuid || !data.candidate) throw new Error("unexpected request in user_sent_peer_ice_candidate");
          peerConnections[data.client_uuid].addIceCandidate(data.candidate);
          onEvent("add peer ice candidate from " + data.client_uuid);
      }

      function user_sent_sdp_answser(data) {
          if (!data.client_uuid || !data.answer) throw new Error("unexpected request in user_sent_peer_ice_candidate");
          peerConnections[data.client_uuid].set_sdp_anwser(data.answer);
      }

      function user_join_request(data) {
          if (!data.client_uuid) throw new Error("unexpected user_join request");
          peerConnections[data.client_uuid] = BroadcasterRTCConnection(signalConnection, data.client_uuid, host_uuid, onEvent);
          peerConnections[data.client_uuid].updateTracks(localTracks);
          if (config.prepareStream) {
              debugger;
              config.prepareStream(peerConnections[data.client_uuid].peerConnection, data.args[0], data.args[1]);
          }

      }
      function updateTrackForPeers() {
          Object.values(peerConnections).forEach(client => {
              client.updateTracks(localTracks);
          });
      }

      function addStream(stream, dimensions) {
          stream.getTracks().forEach(track => {
              addTrack(track, dimensions);
          });
          updateTrackForPeers();
      }

      function removeStream(stream) {
          stream.getTracks().forEach((track) => {
              removeTrack(track);
              track.stop();
          });
          updateTrackForPeers();
          return null;
      }

      function requestUserStream(type) {
          return new Promise(async (resolve, reject) => {
              try {
                  let stream;
                  if (type == "screenshare") {
                      stream = await navigator.mediaDevices.getDisplayMedia();
                  } else if (type == "webcam") {
                      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                  } else if (type == "audio") {
                      stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                  } else {
                      reject(new Error("Unkown type"));
                  }
                  if (stream) resolve(stream);
                  else resolve(null);
              } catch (e) {
                  reject(e);
              }
          })
      }

      return {
          requestUserStream: requestUserStream,
          addStream: addStream,
          removeStream: removeStream,
          peerConnections: peerConnections,
          startBroadcast: startBroadcast,
          broadcastAudio: broadcastAudio
      }
  }
  function BroadcasterRTCConnection(signalConnection, client_uuid, host_uuid, onEvent) {
      var signalConnection = signalConnection;
      var client_uuid = client_uuid;
      var host_uuid;
      var peerConnection = new RTCPeerConnection(peerRTCConfig);
      var metadataChannel = peerConnection.createDataChannel("metadata");

      var trackMap = {};

      metadataChannel.onopen = function () {
          onEvent("Meta channel open with " + client_uuid);
          sendMetaData();
      };
      peerConnection.onicecandidate = (e) => {
          if (e.candidate) {
              signalConnection.send(JSON.stringify({
                  type: "candidate",
                  candidate: e.candidate,
                  to_uuid: client_uuid,
                  host_uuid: host_uuid
              }));
          }
      };
      peerConnection.onnegotiationneeded = async (evt) => {
          onEvent("creating sdp offer for " + client_uuid);
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          signalConnection.send(JSON.stringify({
              type: "offer",
              to_uuid: client_uuid,
              offer: offer,
              host_uuid: host_uuid
          }));
      };
      function sendMetaData() {
          // if (!metadataChannel || metadataChannel.readyState !== 'open') {
          //     onEvent("metadata channel not yet o0pen");
          //     setTimeout(sendMetaData, 1000);
          //     return;
          // }

          let metadata = [];
          let trackIds = Object.keys(trackMap);
          trackIds.forEach(trackId => {
              let track = trackMap[trackId];
              metadata.push({
                  trackId: track.id,
                  dimensions: track.dimensions,
                  live: track.active
              });
          });
          let payload = {
              type: "mediaMetadata",
              data: metadata
          };
          onEvent("sending metadata ", payload);
          metadataChannel.send(JSON.stringify(payload));
      }

      return {
          updateTracks: function (tracks) {
              for (var idx in tracks) {
                  let trackId = tracks[idx].id;
                  if (typeof trackMap[trackId] !== 'undefined') {
                      continue;
                  }
                  trackMap[trackId] = tracks[idx];
                  if (tracks[idx].live) peerConnection.addTrack(tracks[idx].track);
              }
             // sendMetaData();
          },

          set_sdp_anwser: async function (answer) {
              try {
                  await peerConnection.setRemoteDescription(answer);
                  onEvent("Remote Anwser set");
              } catch (e) {
                  onEvent("ERROR: in set_dsp_anwser");
              }
          },
          addIceCandidate: function (candidate) {
              onEvent("add ice candidate ");
              peerConnection.addIceCandidate(candidate);
          },
          peerConnection: peerConnection
      }
  }

  const signalServerURL$1 = window.location.hostname == 'localhost' ? "ws://localhost:9091" : "wss://api.grepawk.com/signal";
  const peerRTCConfig$1 = {
      'RTCIceServers': [{ url: 'stun:stun01.sipphone.com' },
      { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stun.fwdnet.net' },
      { url: 'stun:stun.ideasip.com' },
      { url: 'stun:stun.iptel.org' },
      { url: 'stun:stun.rixtelecom.se' },
      { url: 'stun:stun.schlund.de' },
      { url: 'stun:stun.l.google.com:19302' },
      { url: 'stun:stun1.l.google.com:19302' },
      { url: 'stun:stun2.l.google.com:19302' },
      { url: 'stun:stun3.l.google.com:19302' },
      { url: 'stun:stun4.l.google.com:19302' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
          url: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
      },
      {
          url: 'turn:numb.viagenie.ca',
          credential: 'welcome',
          username: 'yisheng.jiang@gmail.com'
      },
      {
          url: 'turn:192.158.29.39:3478?transport=udp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
      },
      {
          url: 'turn:192.158.29.39:3478?transport=tcp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
      }]
  };


  function BroadcastViewerClient(config) {
      const hostname = config.hostname || signalServerURL$1;
      let onEvent = config.onEvent || console.log;
      let mediaObjectReady = config.mediaObjectReady || console.log;

      let mediaObjectOffline = config.mediaObjectOffline;
      let signalConnection;
      let clientConnection;
      let host_uuid;

      function listChannels() {
          return new Promise((resolve, reject) => {
              signalConnection = new WebSocket(hostname);
              signalConnection.onopen = function (e) {
                  signalConnection.onmessage = function (event) {
                      let data = JSON.parse(event.data);

                      if (data.type === 'list') {
                          signalConnection.close();
                          resolve(data.data);
                      }
                  };

                  signalConnection.send(JSON.stringify({
                      type: "list",
                  }));
              };
          })

      }
      function watchChannel(channelName) {
          signalConnection = new WebSocket(hostname);
          signalConnection.onopen = function (e) {

  debugger;
              signalConnection.onmessage = function (event) {
                  let data = JSON.parse(event.data);
                  switch (data.type) {
                      case 'offer':
                          onEvent("got offer: host_uuid=", data.host_uuid);
                          gotSDP(data.offer, data.host_uuid);
                          break;
                      case 'candidate':
                          onEvent("got candidate");
                          clientConnection.addIceCandidate(data.candidate);
                          break;

                      case 'error':
                          onEvent("Error: " + data.message);
                          break;
                      case 'connected':
                          signalConnection.send(JSON.stringify({
                              type: "watch_stream",
                              channel: channelName
                          }));
                          break;
                  }
              };
          };
      }


      async function gotSDP(offer, hostId) {
          host_uuid = hostId;
          clientConnection = new RTCPeerConnection(peerRTCConfig$1);

          clientConnection.onicecandidate = (e) => {
              onEvent("client on ice candidate ", e);
          
              if (e.candidate) {
                  signalConnection.send(JSON.stringify({
                      type: "candidate",
                      to_uuid: host_uuid,
                      candidate: e.candidate
                  }));
              }
          };
          var remoteTracks = [];
          clientConnection.ontrack = (e) => {
              remoteTracks.push(e.track);
              mediaObjectReady(new MediaStream(remoteTracks));

                      
          };
          clientConnection.onaddstream = (e)=>{
              mediaObjectReady(e.streams[0]);
          };
          await clientConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await clientConnection.createAnswer();
          clientConnection.setLocalDescription(answer);
          signalConnection.send(JSON.stringify({
              type: "answer",
              to_uuid: host_uuid,
              answer: answer
          }));
          /*
              "connectionstatechange": Event;
      "datachannel": RTCDataChannelEvent;
      "icecandidate": RTCPeerConnectionIceEvent;
      "icecandidateerror": RTCPeerConnectionIceErrorEvent;
      "iceconnectionstatechange": Event;
      "icegatheringstatechange": Event;
      "negotiationneeded": Event;
      "signalingstatechange": Event;
      "statsended": RTCStatsEvent;
      "track": RTCTrackEvent;*/
          clientConnection.addEventListener("connectionstatechange", e=>{
              if(e.target.connectState=='connected'){
                  mediaObjectReady(new MediaStream(remoteTracks));
              }
          });
          clientConnection.addEventListener("iceconnectionstatechange", console.log);
          clientConnection.addEventListener("negotiationneeded", console.log);
          clientConnection.addEventListener("signalingstatechange", console.log);
          clientConnection.addEventListener("statsended", console.log);
          clientConnection.addEventListener("track", console.log);
          clientConnection.addEventListener("icecandidateerror", console.log);


      }
      return {
          watchChannel: watchChannel,
          listChannels: listChannels
      }
  }

  function DrawEQ(ctx, filters) {
    var aggregate = new Float32Array(width).fill(0);
    var centerFreqKnobs = Array(filters.length).fill(null);
    var canvas = document.querySelector("#chart .layer1");

    var width = canvas.parentElement.clientWidth;
    var height = canvas.parentElement.clientHeight;

    canvas.setAttribute("width", canvas.parentElement.clientWidth);
    canvas.setAttribute("height", canvas.parentElement.clientHeight);

    var histogram = document.querySelector("#chart .layer2");
    histogram.setAttribute("width", canvas.parentElement.clientWidth);
    histogram.setAttribute("height", canvas.parentElement.clientHeight);
    var htx = histogram.getContext("2d");
    var vtx = canvas.getContext("2d");

    var filterIndexInFocus = -1;

    const noctaves = 11;
    const nyquist = ctx.sampleRate / 2;

    const freqs = calcNyquists(width);
    function xToFreq(x) {
      return freqs[x];
    }
    // const av = new AnalyzerView(c);
    // av.histogram('layer2', width, height);
    // var a = ctx.createAnalyser();
    // c.connect(a).connect(ctx.destination);

    var dbScale = 12;
    var pixelsPerDb = (0.5 * height) / dbScale;
    var curveColor = "rgb(192,192,192)";
    var gridColor = "rgb(100,100,100)";
    // log(freqs);
    canvas.addEventListener("wheel", function (event) {
      event.preventDefault();

      if (event.deltaY < 0) {
        console.log("scrolling up");
        if (canvas_zoomscale < 3) canvas_zoomscale += 0.05;
        dirty = true;
        document.getElementById("status").textContent = "scrolling up";
        drawScalesAndFrequencyResponses();
      } else if (event.deltaY > 0) {
        if (canvas_zoomscale > 0.5) canvas_zoomscale -= 0.05;
        dirty = true;
        drawScalesAndFrequencyResponses();
        console.log("scrolling down");
        document.getElementById("status").textContent = "scrolling down";
      }
    });

    var shiftup = 0;
    function YToDb(y) {
      var db = (0.5 * height - (y - shiftup) / canvas_zoomscale) / pixelsPerDb;
      return db;
    }
    function dbToY(db) {
      var y = (0.5 * height - pixelsPerDb * db) * canvas_zoomscale + shiftup;
      return y;
    }

    var dirty = true;
    var canvas_zoomscale = 1;
    drawScalesAndFrequencyResponses();

    function drawScalesAndFrequencyResponses() {
      //centerFreqKnobs = Array(filters.length).fill(null);
      vtx.clearRect(0, 0, width, height);
      vtx.fillStyle = "rgba(0,22,22,0.01)";
      vtx.fillRect(0, 0, width, height);
      // Draw frequency scale.

      // Draw 0dB line.
      vtx.beginPath();
      vtx.moveTo(0, 0.5 * height);
      vtx.lineTo(width, 0.5 * height);
      vtx.stroke();
      window.n_map = {};

      for (var octave = 0; octave <= noctaves; octave++) {
        var x = (octave * width) / noctaves;
        var f = (ctx.sampleRate / 2) * Math.pow(2.0, octave - noctaves);
        window.n_map[f] = x;

        vtx.strokeStyle = gridColor;
        vtx.moveTo(x, 30);
        vtx.lineTo(x, height);
        vtx.stroke();
        vtx.textAlign = "center";
        vtx.strokeStyle = curveColor;
        vtx.strokeText(f.toFixed(0) + "Hz", x, 20);
      }
      const canvasContext = vtx;
      for (var db = -dbScale; db < dbScale; db += 5) {
        var y = dbToY(db);
        canvasContext.strokeStyle = curveColor;
        canvasContext.strokeText(db.toFixed(0) + "dB", width - 40, y);
        canvasContext.strokeStyle = gridColor;
        canvasContext.beginPath();
        canvasContext.moveTo(0, y);
        canvasContext.lineTo(width, y);
        canvasContext.stroke();
      }

      var magResponse = new Float32Array(width);
      var phaseResponse = new Float32Array(width);
      var aggregate = new Float32Array(width).fill(0);
      var knobRadius = 5;

      vtx.strokeStyle = "white";
      vtx.strokeWidth = "1px";

      for (let i in filters) {
        const filter = filters[i];
        vtx.strokeWidth = 1;
        vtx.beginPath();
        vtx.moveTo(0, height / 0);

        if (dirty == true) {
          filter.getFrequencyResponse(freqs, magResponse, phaseResponse);
          for (var k = 0; k < width; ++k) {
            db = (20.0 * Math.log(magResponse[k])) / Math.LN10;
            var realdb = db; //db * Math.cos(phaseDeg);
            aggregate[k] += realdb;
            let y = dbToY(realdb);
            if (i == filterIndexInFocus) {
              vtx.lineTo(k, dbToY(realdb));
            }
            if (
              k > 0 &&
              freqs[k] >= filter.frequency.value &&
              freqs[k - 1] < filter.frequency.value
            ) {
              centerFreqKnobs[i] = [k, y];
            }
          }
        }
        vtx.strokeWidth = 0;

        vtx.stroke();

        if (i == filterIndexInFocus) {
          vtx.lineTo(width, dbToY(0));
          vtx.lineTo(0, dbToY(0));
          vtx.closePath();
          vtx.fillStyle = `rgb(133,${i * 100},${(i % 2) * 31},0.8)`;
          vtx.fill();
        }
      }

      for (let i = 0; i < centerFreqKnobs.length; i++) {
        if (i == filterIndexInFocus) {
          vtx.fillStyle = "blue";
        } else {
          vtx.fillStyle = "green";
        }
        vtx.beginPath();
        vtx.arc(centerFreqKnobs[i][0], centerFreqKnobs[i][1], knobRadius, 0, Math.PI * 2, false);
        vtx.closePath();
        vtx.fill();
      }

      vtx.beginPath();
      vtx.strokeStyle = "yellow";
      for (var k = 0; k < width; ++k) {
        var y = (20 * Math.log(aggregate[k])) / Math.LN10;
        vtx.lineTo(k, dbToY(aggregate[k]));
      }
      vtx.fillStyle='gray';

      vtx.stroke();
      vtx.closePath();

      vtx.fill();
      dirty = false;
      vtx.strokeText(_closest, 20, 30);
      //requestAnimationFrame(drawScalesAndFrequencyResponses);
    }

    var filterIndexInFocus = -1;
    var lastClick;
    canvas.ondblclick = function (e) {
      log(" time sinze last click " + (ctx.currentTime - lastClick));
      if (filterIndexInFocus > -1) {
        let cval = filters[filterIndexInFocus].gain.value;
        filters[filterIndexInFocus].gain.setValueAtTime(YToDb(e.offsetY), ctx.currentTime);

        dirty = true;
        drawScalesAndFrequencyResponses();
      }
    };
    var mousedown = false;
    canvas.onmousedown = function (e) {
      console.log(e.shiftKey);
      mousedown = true;
    };
    canvas.onmouseup = function (e) {
      mousedown = false;
    };
    canvas.onmousemove = function (e) {
      if (mousedown === false) {
        focusClosest(e);
      }
      if (mousedown === true && filterIndexInFocus > -1) {

        if (e.movementY * e.movementY > 1) {
          _closest = " movementY was " + e.movementY + " offset " + e.offsetY;

          if (e.shiftKey) {
            var modifier = e.movement > 0 ? 0.95 : 1.05;
            filters[filterIndexInFocus].Q.setTargetAtTime(
              filters[filterIndexInFocus].Q.value * modifier,
              ctx.currentTime + 0.001,
              0.001
            );
          } else {
            var targetGain = Math.log10(dbToY(e.offsetY));

            filters[filterIndexInFocus].gain.setTargetAtTime(
              YToDb(e.offsetY),
              ctx.currentTime + 0.001,
              0.001
            );
          }
        }
        if (e.movementX * e.movementX > 10) {
          filters[filterIndexInFocus].frequency.setTargetAtTime(
            xToFreq(e.offsetX),
            ctx.currentTime + 0.001,
            0.001
          );
        }
        dirty = true;
        drawScalesAndFrequencyResponses();
      }
      //  e.offsetX;
    };

    canvas.ondragstart = function (e) {
      focusClosest(e);
    };
    var _closest = "";
    function focusClosest(e) {
      const mousex = e.offsetX;
      var lastFocus = filterIndexInFocus;
      var closest = width;
      lastClick = ctx.currentTime;
      for (let i in centerFreqKnobs) {
        if (centerFreqKnobs[i] === null) continue;
        if (Math.abs(centerFreqKnobs[i][0] - mousex) < closest) {
          filterIndexInFocus = i;
          closest = Math.abs(centerFreqKnobs[i][0] - mousex);
        }
      }

      if (closest < 20 && filterIndexInFocus !== lastFocus) {
        dirty = true;

        _closest = "closest changed at " + closest;
        drawScalesAndFrequencyResponses();
      } else if (closest > 20 && filterIndexInFocus > -1) {
        filterIndexInFocus = -1;
        drawScalesAndFrequencyResponses();
      }
    }

    function calcNyquists(width) {
      var freq = new Float32Array(width);

      for (var k = 0; k < width; ++k) {
        var f = k / width;
        f = Math.pow(2.0, noctaves * (f - 1.0));
        freq[k] = Math.floor(f * nyquist);
      }
      window.allfreqs = freq;
      return freq;
    }

    function postFrameFromFFT(dataArray, analyzer) {
      var barWidth = width / analyzer.frequencyBinCount;
      htx.clearRect(0, 0, width, height);
      // bin_number_to_freq = (i) => nyquist * i /fftSize;
      var fftSize = analyzer.fftSize;

      var sum = 0;
      var x = 0;
      for (let i = 0; i < fftSize; i++) {
        let hue = (i / analyzer.frequencyBinCount) * 360;
        htx.fillStyle = "hsl(" + hue + ", 100%, 50%)";
        var barHeight = dataArray[i] - analyzer.minDecibels;
        htx.fillRect(x, height - barHeight, barWidth, barHeight);

        sum++;
        x = x + barWidth;
      }
      htx.strokeText(dataArray[33], 44, 10, 100);
      document.getElementById("status").contentText = sum;
    }
    return {
      canvas,
      histogram,
      postFrameFromFFT,
      init_bin_to_pixel_map: function () {},
    };
  }

  var $j = jQuery.noConflict();
  $j(".dropdown-toggle").dropdown();
  let audioCtx;
  const overlay = document.getElementById("overlay");
  const std1 = (str)=>document.getElementById("std1").innerHTML = str;

  document.getElementById("dre").onclick = async function (e) {
    overlay.style.display='none';

    audioCtx = new AudioContext();
     await audioCtx.audioWorklet.addModule('../band_pass_lfc/processor.js');

    window.g_audioCtx = audioCtx;

    var audioTag = await Mixer(audioCtx, "ctrls");
    var ytSearch = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: '/samples/yt.json',
      remote: {
        url: '/api/yt/%QUERY',
        wildcard: '%QUERY'
      }
    });

    ytSearch.initialize();
    const template = Handlebars.compile($j("#result-template").html());
    audioTag.add_audio_tag("audio1", 0);
    const audio1 = $("#audio1");
    window.g_audioTag = audioTag;
    var noiseGate = new NoiseGate(audioCtx);
    noiseGate.port.postMessage("ping");
    noiseGate.port.onmessage = (evt) => {
      log(JSON.stringify(evt.data));
    };
    audioTag.outputNode.connect(noiseGate.input);
    var bandpassFilterNode = await new BandPassFilterNode(audioCtx);
    noiseGate.output.connect(bandpassFilterNode);



    var cursor = bandpassFilterNode;

    var compressor = new DynamicsCompressorNode(audioCtx, { threshold: -10, ratio: 20, knee: 10 });

    var group = split_band(audioCtx, [31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);
    bandpassFilterNode.connect(compressor).connect(group.input);

    $("#eq_update_form").appendChild(group.UI_EQ(bandpassFilterNode, compressor));
    cursor = group.output;

    var drawEQ = DrawEQ(audioCtx, group.bands);

    var ctv = AnalyzerView(cursor, { fft: 1024 ,onFftGot: (dataFrame,analyzer)=>{
       drawEQ.postFrameFromFFT(dataFrame,analyzer);
        
    } });

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
        command: 'record',
        buffer: buffer
      });
      counter += buffer.length;
    };

    var playbackGain = audioCtx.createGain({ gain: 1 });

    ctv.analyzer.connect(recorderProcessor);

    recorderProcessor.connect(playbackGain);
    playbackGain.connect(audioCtx.destination);

    var isRecording = false;
    const outputdiv = $("#output_cp");
    const rtcViewer = $("video#rtc");

    const playbackGainSlider = slider(outputdiv, { wrap: "inline", prop: playbackGain.gain, min: "0", max: "4", step: "0.05", label: "Local Playback gain" });
   
   var bv = BroadcastViewerClient({
        onEvent: log,
        mediaObjectReady: function (stream) {
  	        var streamsource= audioCtx.createMediaStreamSource(stream);
           streamsource.connect(ctv.analyzer);
           rtcViewer.srcObject = stream;
           rtcViewer.autoplay = true;
        }
      });


    if(location.hash && location.hash.substr(1)){

      var cmd = location.hash.substr(1).split("/")[0];
      var arg1 =  location.hash.substr(1).split("/")[1];
      switch(cmd){
        case 'watch':
        case 'listen':
          std1("connecting to "+arg1);
         
  	      bv.watchChannel(arg1);

          break;
  	}
  }

    bv.listChannels().then(channels => {
      for (const channel of Object.values(channels)) {
        var a = document.createElement("a");
        a.className='dropdown-item';
        a.onclick = function () {
          bv.watchChannel(channel.name);
        };
        a.href = "#listen:"+channel.name;
        a.innerText = channel.name;
        $("#listen-menu").append(a);
      }
     });
    $("#obs").onclick = function (e) {
      var userId = window.location.search.replace("?", "")
        || prompt("enter display name", (localStorage.getItem("displayName") || ""))
        || ("user_" + Math.floor(Math.random() * 10));

      var peer = audioCtx.createMediaStreamDestination();
      playbackGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      playbackGainSlider.value = "0.001";
      recorderProcessor.connect(peer);
      localStorage.setItem("displayName", userId);
      BroadcasterClient({
        onEvent: window.log
      }).broadcastAudio(userId, peer.stream);
            std1(`Broadcasting now to <input type=text id=urlinput size=80 value='https://dsp.grepawk.com#listen/${userId}'>`);
            document.getElementById("cplink").style.display="inline";


    };

    const audio22 = $("video#rtc");


    $("#recorder").onclick = function (e) {
      var t;
      function showCounter() {
        document.getElementById("rinfo").innerHTML = (counter / 1000) + "kb";
        t = setTimeout(showCounter, 1000);
      }
      if (isRecording == false) {
        showCounter();
        isRecording = true;
        e.target.innerText = 'Done';
      } else {
        isRecording = false;
        rworker.postMessage({
          command: "exportWAV",
          type: "audio/wav"
        });
        e.target.innerText = 'record';

        cancelAnimationFrame(t);
      }
    };
    var rworker = new Worker('recorder-worker.js');
    rworker.postMessage({
      command: 'init',
      config: {
        sampleRate: audioCtx.sampleRate,
        numChannels: 2,
      }
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

    $("#overlay").style.zIndex = -99;

    var ytSearch = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: '/samples/yt.json',
      remote: {
        url: '/api/yt/%QUERY',
        wildcard: '%QUERY'
      }
    });

  ytSearch.initialize();
  $j('#ytsearch').typeahead(
    { hint: true, highlight: true,minLength: 1},
    { 
      name: 'ytmusic', 
      templates: {
        empty: ['<div class="empty-message">','not found','</div>'].join('\n'),
        suggestion: template
      },
      displayKey: 'title',source: ytSearch
    })
    .on('typeahead:selected', function(evt, item) {
      
      audio1.src = '/api/'+item.vid+'.mp3';
      
      return item;
    });


    window.vfs = [group, audioTag, noiseGate, bandpassFilterNode, audioCtx, group];

    window.index_stdin = function (str) {
      const cmd = str.split(" ")[0];
      const arg1 = str.split(" ")[1] || "";
      const arg2 = str.split(" ")[2] || "";
      switch (cmd) {
        case 'debug':
          switch (arg1) {
            case 'group': group.aggregate_fr(); break;
          }
        case "ls":
          return JSON.stringify(window.g_audioTag)
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
        default: return false;
      }
    };



    con.element.style.zIndex = 99;
    con.element.addEventListener("click", function () { this.querySelector("input").focus(); });
    window.onkeydown = function (evt) {
      if (evt.code == "Enter") {
        con.element.querySelector("input").focus();
      }
    };


    var blobbb = window.URL || window.webkitURL;

    document.getElementById('file').addEventListener('change', function (event) {
      var file = this.files[0];
      var fileURL = blobbb.createObjectURL(file);
      $("#audio2").src = fileURL;
      $("#audio2").autoplay = true;
    });
  };
  window.copylink=function(){
    document.getElementbyId("urlinput").select();
    document.select();
    document.copy();
    this.innerText='copied';
  }; 
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
          .then((reg) => {
            console.log('Service worker registered.', reg);
          });
    });
  }

}());

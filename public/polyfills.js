window.requestAnimFrame = (function ()
{
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback,element)
        {
            window.setTimeout(callback,1000 / 60);
        };
})();
window.AudioContext = (function ()
{
    return window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();


var con = new SimpleConsole({
    placeholder: "",
    id: "console",
    handleCommand: function (command)
    {
        try {
            var resp = index_stdin(command) || eq_stdin(command) || con.log("..");
            con.log(resp)
        } catch (error) {
            con.log(error);
        }
    },
    autofocus: true, // if the console is to be the primary interface of the page
    storageID: "app-console", // or e.g. "simple-console-#1" or "workspace-1:javascript-console"
})
 document.getElementById("console") ? document.getElementById("console").append(con.element) : document.body.append(con.element);

window.con = con;
// add the console to the page

window.log = con.log;
window.logErr = con.logError;
con.element.addEventListener("click",function () { this.querySelector("input").focus() });

window.onerror = function (msg,url,lineNo,columnNo,error)
{
    con.log([msg,url,lineNo,columnNo,error].join(', '))

}
window.log = (txt) => con.log(txt);;


window.logErr = function (text)
{
    if (typeof text === 'object') text = JSON.stringify(text,null,'\n');
    window.log(text);

}
const $ = (selector) => document.querySelector(selector);
document.onload = function ()
{
    $('.canvas_wrapper')
}
function wrap(el,wrapper)
{
    el.parentNode.insertBefore(wrapper,el);
    wrapper.appendChild(el);
}
HTMLElement.prototype.wrap = function (parent_tag)
{
    let p = document.createElement(parent_tag);
    p.appendChild(this)
    return p;
}

const bigchart_ctx = $("#big-chart") && $("#big-chart").getContext('2d');
/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/* 

This monkeypatch library is intended to be included in projects that use 
webkitAudioContext (instead of AudioContext), and that may use the now-
deprecated bits of the Web Audio API (e.g. using BufferSourceNode.noteOn()
instead of BufferSourceNode.start().

This library should be harmless to include if the browser does not have
the unprefixed "AudioContext" implemented.  If unprefixed AudioContext is
supported, but the deprecated method names are already implemented, this
library will have created a few shim functions on create* methods, but 
will not damage or override anything else.

Ideally, the use of this library will go to zero - it is only intended as
a way to quickly get script written to the old Web Audio methods to work
in browsers that only support the new, approved methods.

The patches this library handles:

AudioBufferSourceNode.noteOn() is aliased to start()
AudioBufferSourceNode.noteGrainOn() is aliased to start()
AudioBufferSourceNode.noteOff() is aliased to stop()
AudioContext.createGainNode() is aliased to createGain()
AudioContext.createDelayNode() is aliased to createDelay()
AudioContext.createJavaScriptNode() is aliased to createScriptProcessor()
OscillatorNode.noteOn() is aliased to start()
OscillatorNode.noteOff() is aliased to stop()
AudioParam.setTargetValueAtTime() is aliased to setTargetAtTime()
OscillatorNode's old enum values are aliased to the Web IDL enum values.
BiquadFilterNode's old enum values are aliased to the Web IDL enum values.
PannerNode's old enum values are aliased to the Web IDL enum values.
AudioContext.createWaveTable() is aliased to createPeriodicWave().
OscillatorNode.setWaveTable() is aliased to setPeriodicWave().

*/
(function (global, exports, perf) {
  'use strict';

  function fixSetTarget(param) {
    if (!param)	// if NYI, just return
      return;
    if (!param.setTargetValueAtTime)
      param.setTargetValueAtTime = param.setTargetAtTime; 
  }

  if (window.hasOwnProperty('AudioContext') /*&& !window.hasOwnProperty('webkitAudioContext') */) {
    window.webkitAudioContext = AudioContext;

    if (!AudioContext.prototype.hasOwnProperty('internal_createGain')){
      AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
      AudioContext.prototype.createGain = function() { 
        var node = this.internal_createGain();
        fixSetTarget(node.gain);
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createDelay')){
      AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
      AudioContext.prototype.createDelay = function() { 
        var node = this.internal_createDelay();
        fixSetTarget(node.delayTime);
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createBufferSource')){
      AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
      AudioContext.prototype.createBufferSource = function() { 
        var node = this.internal_createBufferSource();
        if (!node.noteOn)
          node.noteOn = node.start; 
        if (!node.noteGrainOn)
          node.noteGrainOn = node.start;
        if (!node.noteOff)
          node.noteOff = node.stop;
        fixSetTarget(node.playbackRate);
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createDynamicsCompressor')){
      AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
      AudioContext.prototype.createDynamicsCompressor = function() { 
        var node = this.internal_createDynamicsCompressor();
        fixSetTarget(node.threshold);
        fixSetTarget(node.knee);
        fixSetTarget(node.ratio);
        fixSetTarget(node.reduction);
        fixSetTarget(node.attack);
        fixSetTarget(node.release);
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createBiquadFilter')){
      AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
      AudioContext.prototype.createBiquadFilter = function() { 
        var node = this.internal_createBiquadFilter();
        fixSetTarget(node.frequency);
        fixSetTarget(node.detune);
        fixSetTarget(node.Q);
        fixSetTarget(node.gain);
        var enumValues = ['LOWPASS', 'HIGHPASS', 'BANDPASS', 'LOWSHELF', 'HIGHSHELF', 'PEAKING', 'NOTCH', 'ALLPASS'];
        for (var i = 0; i < enumValues.length; ++i) {
          var enumValue = enumValues[i];
          var newEnumValue = enumValue.toLowerCase();
          if (!node.hasOwnProperty(enumValue)) {
            node[enumValue] = newEnumValue;
          }
        }
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createOscillator') &&
         AudioContext.prototype.hasOwnProperty('createOscillator')) {
      AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function() { 
        var node = this.internal_createOscillator();
        if (!node.noteOn)
          node.noteOn = node.start; 
        if (!node.noteOff)
          node.noteOff = node.stop;
        fixSetTarget(node.frequency);
        fixSetTarget(node.detune);
        var enumValues = ['SINE', 'SQUARE', 'SAWTOOTH', 'TRIANGLE', 'CUSTOM'];
        for (var i = 0; i < enumValues.length; ++i) {
          var enumValue = enumValues[i];
          var newEnumValue = enumValue.toLowerCase();
          if (!node.hasOwnProperty(enumValue)) {
            node[enumValue] = newEnumValue;
          }
        }
        if (!node.hasOwnProperty('setWaveTable')) {
          node.setWaveTable = node.setPeriodicTable;
        }
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('internal_createPanner')) {
      AudioContext.prototype.internal_createPanner = AudioContext.prototype.createPanner;
      AudioContext.prototype.createPanner = function() {
        var node = this.internal_createPanner();
        var enumValues = {
          'EQUALPOWER': 'equalpower',
          'HRTF': 'HRTF',
          'LINEAR_DISTANCE': 'linear',
          'INVERSE_DISTANCE': 'inverse',
          'EXPONENTIAL_DISTANCE': 'exponential',
        };
        for (var enumValue in enumValues) {
          var newEnumValue = enumValues[enumValue];
          if (!node.hasOwnProperty(enumValue)) {
            node[enumValue] = newEnumValue;
          }
        }
        return node;
      };
    }

    if (!AudioContext.prototype.hasOwnProperty('createGainNode'))
      AudioContext.prototype.createGainNode = AudioContext.prototype.createGain;
    if (!AudioContext.prototype.hasOwnProperty('createDelayNode'))
      AudioContext.prototype.createDelayNode = AudioContext.prototype.createDelay;
    if (!AudioContext.prototype.hasOwnProperty('createJavaScriptNode'))
      AudioContext.prototype.createJavaScriptNode = AudioContext.prototype.createScriptProcessor;
    if (!AudioContext.prototype.hasOwnProperty('createWaveTable'))
      AudioContext.prototype.createWaveTable = AudioContext.prototype.createPeriodicWave;
  }

  if (window.hasOwnProperty('OfflineAudioContext')
      /*&& !window.hasOwnProperty('webkitOfflineAudioContext') */) {
    window.webkitOfflineAudioContext = OfflineAudioContext;
  }
}(window));
AudioContext = window.AudioContext || window.webkitAudioContext;

(function(scope) {
  "use strict";

  // namespace to avoid global scope pollution
  window.AWPF = window.AWPF || {}
  AWPF.hasSAB = window.SharedArrayBuffer !== undefined;
  AWPF.origin = "";

  // --------------------------------------------------------------------------
  //
  //
  AWPF.PolyfillAudioWorklet = function() {
    var imports = {};
    var importedScripts = [];

    function importOnWorker(src) {
      if (!AWPF.worker.onmessage) AWPF.worker.onmessage = onmessage;
      return new Promise(function(resolve, reject) {
        if (importedScripts.indexOf(src) < 0) {
          imports[src] = { resolve:resolve, reject:reject };
          AWPF.worker.postMessage({ type:"import", url:src });
          importedScripts.push(src);
        }
        else resolve();
      });
    }

    var onmessage = function (e) {
      var msg = e.data;
      switch (msg.type) {
        case "load":
          var script = imports[msg.url];
          if (script) {
            if (!msg.error) script.resolve();
            else script.reject(Error('Failed to load ' + msg.url));
            delete imports[msg.url];
          }
          else console.log("throw: already registered");
          // else throw new Error("InvalidStateError");
          break;
        case "register":
          AWPF.descriptorMap[msg.name] = msg.descriptor;
          break;
        case "state":
          var node = AWPF.workletNodes[msg.node];
          if (node) {
            if (msg.state == "running")
              node.processor = msg.processor;
            var event = new CustomEvent('statechange', { detail: msg.state });
            node.onprocessorstatechange(event);
          }
          break;
        case "process":
          var node = AWPF.workletNodes[msg.node];
          node.onRender(msg.buf);
          break;
      }
    }

    return { addModule:importOnWorker }
  }

  // --------------------------------------------------------------------------
  //
  //
  AWPF.AudioWorkletNode = function (context, nodeName, options) {

    if (AWPF.descriptorMap[nodeName] === undefined)
      throw new Error("NotSupportedException");
    // TODO step 9

    this.id = AWPF.workletNodes.length;
    AWPF.workletNodes.push(this);

    var messageChannel = new MessageChannel();
    this.port = messageChannel.port1;

    // -- SPN min bufsize is 256, and it has max one input and max one output port
    //
    options = options || {}
    options.buflenAWP = options.buflenAWP || 128;
    options.buflenSPN = options.buflenSPN || 256;
    options.numberOfInputs = options.numberOfInputs || 0;
    if (options.numberOfOutputs === undefined)      options.numberOfOutputs = 1;
    if (options.outputChannelCount === undefined)   options.outputChannelCount = [1];
    if (options.inputChannelCount === undefined)    options.inputChannelCount  = [];
  //if (options.inputChannelCount.length  != options.numberOfInputs)  throw new Error("InvalidArgumentException");
    if (options.outputChannelCount.length != options.numberOfOutputs) throw new Error("InvalidArgumentException");

    var nslices = (options.buflenSPN / options.buflenAWP) | 0;
    var bytesPerBuffer = options.buflenAWP * nslices * 4;

    function configurePort (type, options) {
      var nports = (type == "input") ? options.numberOfInputs : options.numberOfOutputs;
      if (nports > 0) {
        var nchannels = 0;
        var channelCount = (type == "input") ? options.inputChannelCount : options.outputChannelCount;
        if (channelCount.length > 0) nchannels = channelCount[0];
        if (nchannels <= 0) throw new Error("InvalidArgumentException");
        var port = new Array(nchannels);
        for (var c=0; c<nchannels; c++)
          if (AWPF.hasSAB)
            port[c] = new SharedArrayBuffer(bytesPerBuffer);
          else {
            port[c] = new Array(2);
            for (var pingpong = 0; pingpong < 2; pingpong++) {
              var ab = new ArrayBuffer(bytesPerBuffer);
              port[c][pingpong] = new Float32Array(ab);
            }
          }
        return port;
      }
      return null;
    }

    // -- io configuration is currently static
    var audioIn  = configurePort("input",  options);
    var audioOut = configurePort("output", options);

    // -- create processor
    this.processorState = "pending";
    var args = { node:this.id, name:nodeName, options:options, hasSAB:AWPF.hasSAB }
    args.audio = { input:audioIn, output:audioOut }
    AWPF.worker.postMessage({ type:"createProcessor", args:args }, [messageChannel.port2])

    this.onprocessorstatechange = function (e) {
      this.processorState = e.detail;
      if (!AWPF.hasSAB && this.processorState == "running")
        render();
      console.log("state:", e.detail);
    }

    // -- fix for blocked SABs -------------------------------------------------

    if (!AWPF.hasSAB) {
      var curbuf = 0;
      var newBufferAvailable = false;
      var self = this;

      var render = function () {
        var msg = { type:"process", processor:self.processor, time:context.currentTime, buf:[] };
        for (var c=0; c<audioOut.length; c++)
          msg.buf.push(audioOut[c][curbuf].buffer);
        AWPF.worker.postMessage(msg, msg.buf);
        curbuf = ((curbuf + 1) % 2) | 0;
        newBufferAvailable = false;
      }

      this.onRender = function (buf) {
        audioOut[0][curbuf ? 0:1] = new Float32Array(buf[0]);
        audioOut[1][curbuf ? 0:1] = new Float32Array(buf[1]);
        newBufferAvailable = true;
      }
    }

    // -- ScriptProcessorNode -------------------------------------------------

    let ninChannels  = options.inputChannelCount[0] || 0;
    let noutChannels = options.outputChannelCount[0];
    var spn = context.createScriptProcessor(options.buflenSPN, ninChannels, noutChannels);
    this.input = spn;

    this.connect = function (dst) {
      spn.onaudioprocess = onprocess.bind(this);
      spn.connect(dst)
    }

    this.disconnect = function () {
      spn.onaudioprocess = null;
      spn.disconnect();
    }

    if (AWPF.hasSAB)  var outbuf = new Float32Array(audioOut[0]);  // spn limitation

    var onprocess = function (ape) {
      if (this.processor === undefined) return;

      var ibuff = ape.inputBuffer;
      var obuff = ape.outputBuffer;
      var outL  = obuff.getChannelData(0);

      if (AWPF.hasSAB) {
        outL.set(outbuf);
        var msg = { type:"process", processor:this.processor, time:context.currentTime };
        AWPF.worker.postMessage(msg);
      }
      else {
        for (var c=0; c<audioOut.length; c++)
          obuff.getChannelData(c).set(audioOut[c][curbuf]);
        if (newBufferAvailable)
          render();
      }
    }
  }

  // --------------------------------------------------------------------------

  // -- borrowed from Google's AudioWorklet demo page
  AWPF.AudioWorkletAvailable = function (actx) {
    return actx.audioWorklet &&
      actx.audioWorklet instanceof AudioWorklet &&
      typeof actx.audioWorklet.addModule === 'function' &&
      window.AudioWorkletNode;
  }

  AWPF.polyfill = function (scope, forcePolyfill) {
    return new Promise( function (resolve) {

      if (!forcePolyfill && AWPF.AudioWorkletAvailable(scope))
        resolve();
      else {
        AWPF.descriptorMap = {}; // node name to parameter descriptor map (should be in BAC)
        AWPF.workletNodes  = [];
        AWPF.audioWorklet = AWPF.PolyfillAudioWorklet();
        AWPF.context = scope;
        if (!forcePolyfill || !AWPF.AudioWorkletAvailable(scope))
          scope.audioWorklet = AWPF.audioWorklet;
        window.AudioWorkletNode = AWPF.AudioWorkletNode;

        fetch(AWPF.origin + "audioworker.js").then(function (resp) {
          resp.text().then(function (s) {
            var u = window.URL.createObjectURL(new Blob([s]));
            AWPF.worker = new Worker(u);
            AWPF.worker.postMessage({ type:"init", sampleRate:scope.sampleRate });

            console.warn('Using Worker polyfill of AudioWorklet');
            AWPF.isAudioWorkletPolyfilled = true;
            resolve();
          })
        })
      }
    })
  }
})();

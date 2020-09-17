(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@polymer/lit-element')) :
   typeof define === 'function' && define.amd ? define(['exports', '@polymer/lit-element'], factory) :
   (global = global || self, factory(global.grepawk_audio = {}, global.litElement));
}(this, (function (exports, litElement) { 'use strict';

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

   const Piano = `{"real":[0,0,-0.203569,0.5,-0.401676,0.137128,-0.104117,0.115965,-0.004413,0.067884,-0.00888,0.0793,-0.038756,0.011882,-0.030883,0.027608,-0.013429,0.00393,-0.014029,0.00972,-0.007653,0.007866,-0.032029,0.046127,-0.024155,0.023095,-0.005522,0.004511,-0.003593,0.011248,-0.004919,0.008505,-0.00292,0.00152,-0.005641,0.002615,-0.001866,0.001316,-0.00032,0.0008,-0.000957,0.001989,-0.001172,0.001682,-0.00262,0.000544,-0.000734,0.000186,-0.000363,0.000243,-0.000142,0.000437,-0.00086,0.000117,-0.00035,0.00011,-0.000253,0.000218,-0.000061,0.000015,-0.000038,0.000017,-0.000025,0.000007,-0.000081,0.000017,-0.000064,0.000166,-0.000009,0.000013,-0.000024,0.000001,-0.000032,0.000013,-0.000018,0.000007,-0.000013,0.00001,-0.000023,0.000008,-0.000025,0.000046,-0.000035,0.000006,-0.000012,0.000012,-0.000024,0.000023,-0.000024,0.000027,-0.00001,0.000022,-0.000011,0.000021,-0.000007,0.000011,-0.000006,0.000021,-0.000014,0.000026,-0.000013,0.000003,-0.000032,0.000033,-0.000036,0.000025,-0.00002,0.000026,-0.00005,0.000028,-0.000013,0.000008,-0.000018,0.00002,-0.000086,0.00012,-0.000005,0.000012,-0.000016,0.000028,-0.000012,0.000006,-0.000015,0.000012,-0.000022,0.000012,-0.000023,0.000024,-0.000011,0.000022,-0.000009,0.000018,-0.000019,0.000013,-0.000042,0.000015,-0.000019,0.000014,-0.000019,0.000007,-0.000008,0.00003,-0.000011,0.000011,-0.000012,0.000022,-0.000007,0.000018,-0.000028,0.000025,-0.00002,0.000008,-0.000032,0.000022,-0.00001,0.000013,-0.000026,0.000013,-0.000024,0.000009,-0.000107,0.000109,-0.000007,0.000014,-0.000015,0.000007,-0.000029,0.000045,-0.000023,0.000039,-0.00001,0.000029,-0.000008,0.000036,-0.000018,0.000007,-0.000007,0.000007,-0.000025,0.00001,-0.000006,0.000022,-0.000021,0.000007,-0.000018,0.000011,-0.000011,0.00001,-0.000015,0.00002,-0.000012,0.000004,-0.000005,0.000007,-0.000007,0.000003,-0.000001,0.000006,-0.000007,0.000018,-0.000002,0.000005,-0.000008,0.000006,-0.00001,0.000016,-0.00001,0.000021,-0.000011,0.000013,-0.000011,0.000005,-0.000006,0.000016,-0.000014,0.000014,-0.000009,0.000009,-0.000004,0.000013,-0.000015,0.000004,-0.000007,0.000007,-0.000004,0.000004,-0.000009,0.00001,-0.000008,0.000013,-0.000012,0.000001,-0.000003,0.000012,-0.000004,0.000004,-0.000007,0.000008,-0.00001,0.000013,-0.000015,0.000013,-0.00001,0.000012,-0.000008,0.000011,-0.000024,0.000008,-0.000013,0.000013,-0.000018,0.000005,-0.000022,0.000037,-0.000019,0.000027,-0.000022,0.000026,-0.000029,0.000029,-0.000029,0.000031,-0.000034,0.000032,-0.000031,0.000037,-0.000033,0.000038,-0.000038,0.000039,-0.000036,0.000035,-0.000038,0.000035,-0.000034,0.000033,-0.00003,0.000029,-0.000028,0.000025,-0.000023,0.000022,-0.00002,0.000018,-0.000017,0.000015,-0.000014,0.000013,-0.000012,0.000011,-0.000011,0.00001,-0.000009,0.000009,-0.000009,0.000008,-0.000008,0.000008,-0.000008,0.000007,-0.000007,0.000007,-0.000007,0.000006,-0.000006,0.000006,-0.000006,0.000006,-0.000005,0.000006,-0.000006,0.000005,-0.000005,0.000005,-0.000005,0.000005,-0.000005,0.000005,-0.000005,0.000004,-0.000004,0.000004,-0.000005,0.000004,-0.000004,0.000004,-0.000004,0.000004,-0.000004,0.000004,-0.000004,0.000004,-0.000003,0.000004,-0.000004,0.000003,-0.000003,0.000003,-0.000004,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000002,0.000003,-0.000003,0.000003,-0.000002,0.000003,-0.000003,0.000002,-0.000002,0.000002,-0.000003,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000001,0.000002,-0.000002,0.000002,-0.000001,0.000002,-0.000002,0.000002,-0.000001,0.000002,-0.000002,0.000001,-0.000001,0.000002,-0.000002,0.000001,-0.000001,0.000001,-0.000002,0.000001,-0.000001,0.000001,-0.000002,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0,0,0.000001,-0.000001,0,0,0,-0.000001,0,0,0,-0.000001,0,0,0,-0.000001,0,0,0,-0.000001,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"imag":[0,0.147621,-0.000001,0.000007,-0.00001,0.000005,-0.000006,0.000009,0,0.000008,-0.000001,0.000014,-0.000008,0.000003,-0.000009,0.000009,-0.000005,0.000002,-0.000007,0.000005,-0.000005,0.000005,-0.000023,0.000037,-0.000021,0.000022,-0.000006,0.000005,-0.000004,0.000014,-0.000007,0.000012,-0.000004,0.000002,-0.00001,0.000005,-0.000004,0.000003,-0.000001,0.000002,-0.000002,0.000005,-0.000003,0.000005,-0.000008,0.000002,-0.000002,0.000001,-0.000001,0.000001,-0.000001,0.000002,-0.000003,0,-0.000002,0,-0.000001,0.000001,0,0,0,0,0,0,0,0,0,0.000001,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.000001,-0.000001,0,0,0,-0.000001,0,0,0,0,0,-0.000002,0.000002,0,0,0,0.000001,0,0,0,0,0,0,-0.000001,0.000001,0,0.000001,0,0,-0.000001,0,-0.000001,0,-0.000001,0,-0.000001,0,0,0.000001,0,0,0,0.000001,0,0.000001,-0.000001,0.000001,-0.000001,0,-0.000001,0.000001,0,0,-0.000001,0,-0.000001,0,-0.000004,0.000004,0,0.000001,-0.000001,0,-0.000001,0.000002,-0.000001,0.000002,0,0.000001,0,0.000002,-0.000001,0,0,0,-0.000001,0,0,0.000001,-0.000001,0,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0,0,0,0,0,0,0,0,0.000001,0,0,0,0,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0,0,0.000001,-0.000001,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0,-0.000001,0,0,0,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0,0,0.000001,0,0,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000002,0.000001,-0.000001,0.000001,-0.000002,0,-0.000002,0.000004,-0.000002,0.000003,-0.000002,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000003,0.000004,-0.000004,0.000004,-0.000004,0.000004,-0.000004,0.000004,-0.000004,0.000004,-0.000004,0.000004,-0.000003,0.000003,-0.000003,0.000003,-0.000003,0.000003,-0.000002,0.000002,-0.000002,0.000002,-0.000002,0.000002,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0.000001,0,0.000001,-0.000001,0,0,0.000001,-0.000001,0,0,0,-0.000001,0,0,0,-0.000001,0,0,0,-0.000001,0,0,0,-0.000001,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}`;

   /* eslint-disable no-debugger */
   const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];
   const notes = [
     261.63,
     277.18,
     293.66,
     311.13,
     329.63,
     349.23,
     369.99,
     392,
     415.3,
     440,
     466.16,
     493.88,
   ];
   const isblack = (key) => ["w", "e", "t", "y", "u"].indexOf(key) >= 0;

   const freqmultiplierindex = [0, 0.25, 0.5, 1, 2, 4];
   const css = `:host{box-sizing:border-box;padding:5px;max-width:100vw} 
ul{height:18.875em;width:80em;margin:5em auto;padding:2em 0 0 2em;position:relative;border:1px solid #160801;border-radius:1em;background:black} 
li{margin:0;padding:0;list-style:none;position:relative;float:left} ul .white{height:16em;width:3.8em;z-index:1;border-left:1px solid #bbb;border-bottom:1px solid #bbb;border-radius:0 0 5px 5px;box-shadow:-1px 0 0 rgba(255,255,255,.8) inset,0 0 5px #ccc inset,0 0 3px rgba(0,0,0,.2);background:linear-gradient(to bottom,#eee 0,#fff 100%);margin:0 0 0 -1em}
ul .white:active{border-top:1px solid #777;border-left:1px solid #999;border-bottom:1px solid #999;box-shadow:2px 0 3px rgba(0,0,0,.1) inset,-5px 5px 20px rgba(0,0,0,.2) inset,0 0 3px rgba(0,0,0,.2);background:linear-gradient(to bottom,#fff 0,#e9e9e9 100%)}
ul .white.pressed{border-top:1px solid #777;border-left:1px solid #999;border-bottom:1px solid #999;box-shadow:2px 0 3px rgba(0,0,0,.1) inset,-5px 5px 20px rgba(0,0,0,.2) inset,0 0 3px rgba(0,0,0,.2);background:linear-gradient(to bottom,#fff 0,#e9e9e9 100%)}
.black{height:8em;width:2em;margin:0 0 0 -1em;z-index:2;border:1px solid #000;border-radius:0 0 3px 3px;box-shadow:-1px -1px 2px rgba(255,255,255,.2) inset,0 -5px 2px 3px rgba(0,0,0,.6) inset,0 2px 4px rgba(0,0,0,.5);background:linear-gradient(45deg,#222 0,#555 100%)}
.black:active{box-shadow:-1px -1px 2px rgba(255,255,255,.2) inset,0 -2px 2px 3px rgba(0,0,0,.6) inset,0 1px 2px rgba(0,0,0,.5);background:linear-gradient(to right,#444 0,#222 100%)}.a,.c,.d,.f,.g{margin:0 0 0 -1em}ul li:first-child{border-radius:5px 0 5px 5px}ul li:last-child{border-radius:0 5px 5px 5px}
.black.pressed{box-shadow:-1px -1px 2px rgba(255,255,255,.2) inset,0 -2px 2px 3px rgba(0,0,0,.6) inset,0 1px 2px rgba(0,0,0,.5);background:linear-gradient(to right,#444 0,#222 100%)}.a,.c,.d,.f,.g{margin:0 0 0 -1em}ul li:first-child{border-radius:5px 0 5px 5px}ul li:last-child{border-radius:0 5px 5px 5px}`;

   const waveShaper = JSON.parse(Piano);

   class PianoKeyboard extends HTMLElement {
     constructor() {
       super();
       this.params = {
         min: 0,
         max: 4,
         attack: 0.01,
         decay: 0.05,
         sustain: 0.1,
         release: 0.01, //0.01
         octave: 2,
       };
       this.waveshaper = waveShaper;
       this.keyDomelements = {};
       this.adsrs = {};
       this.initialized = false;
       function _key(note, key) {
         return `<li
      id='${note}' 
      data-note='${note}' 
      class="${isblack(key) ? "black" : "white"}"> ${key}</li>`;
       }
       this.attachShadow({ mode: "open" });
       this.shadowRoot.innerHTML = `<style>${css}</style>`;
       const list = document.createElement("ul");
       [2, 3, 4].forEach((octave) => {
         keys.forEach((key, index) => {
           list.innerHTML += _key(notes[index] * freqmultiplierindex[octave], key);
         });
       });
       this.shadowRoot.appendChild(list); // += "</ul>";
     }

     connectedCallback() {
       var self = this;
       this.shadowRoot.querySelectorAll("li").forEach((el) => {
         el.addEventListener("mousedown", (e) => {
           if (!e.target.dataset.note) return false;
           const note = parseFloat(e.target.dataset.note);
           if (!self.adsrs[note]) {
             self.adsrs[note] = self._getNote(note);
           }
           self.adsrs[note].trigger(self.ctx.currentTime);
         });

         el.addEventListener("mouseup", (e) => {
           const note = parseFloat(e.target.dataset.note);
           self.adsrs[note] && self.adsrs[note].release(self.ctx.currentTime);
         });
       });

       window.onkeydown = function (e) {
         const index = keys.indexOf(e.key);
         if (index < 0) return;
         const note = notes[index];
         self.shadowRoot.getElementById(note).classList.toggle("pressed");
         if (!self.adsrs[note]) {
           self.adsrs[note] = self._getNote(note);
         }
         self.adsrs[note].trigger(self.ctx.currentTime);
       };
       window.onkeyup = function (e) {
         const index = keys.indexOf(e.key);
         if (index > -1) {
           const note = notes[index];
           self.shadowRoot.getElementById(note).classList.toggle("pressed");

           self.adsrs[note] && self.adsrs[note].release(self.ctx.currentTime);
         }
       };
     }

     attributeChangedCallback(name, oldval, newval) {
       super.attributeChangedCallback(name, oldval, newval);
     }

     render() {
       return `<ul>
      ${keys.map(
        (value, index) =>
          `<li data-note='${notes[index]}' class="${
            isblack(value) ? "black" : "white"
          }"></li>`
      )}
      </ul>`;
     }

     _getNote(note) {
       this.ctx = this.ctx || window.g_audioCtx || new AudioContext();
       let ctx = this.ctx;
       this.masterGain = this.masterGain || new GainNode(this.ctx);
       this.masterGain.connect(ctx.destination);
       const { min, max, attack, decay, sustain, release } = this.params;
       var freq_multiplier = freqmultiplierindex[this.params.octave];

       var offfreq_attenuator = new GainNode(ctx, { gain: 1 });
       var osc1 = ctx.createOscillator();

       osc1.frequency.value = note * freq_multiplier;
       osc1.type = "square";

       var osc2 = ctx.createOscillator();
       osc2.frequency.value = note * freq_multiplier * 2;
       osc2.type = "sine";

       var gain = new GainNode(ctx, { gain: 1 });

       if (this.waveShaper) {
         osc1.setPeriodicWave(this.waveShaper);
         osc2.setPeriodicWave(this.waveshaper);
       }
       osc1.connect(gain);
       osc2.connect(offfreq_attenuator).connect(gain);
       var gainEnvelope = new Envelope(
         min,
         max,
         attack,
         decay,
         sustain,
         release,
         gain.gain
       );
       osc1.start(0);
       osc2.start(0);

       gain.connect(this.masterGain);
       gain.connect(this.masterGain);
       // gainEnvelope.trigger(ctx.currentTime);
       return gainEnvelope;
     }

     _onTouchEnd(e) {
       const note = parseFloat(e.target.dataset.note);
       // if( this.asdrs[note]){
       //   this.asdrs[note] = this._getNote(note);
       // }
       taht.asdrs[note] && taht.asdrs[note].release();
     }
   }

   window.customElements.define("piano-keyboard", PianoKeyboard);

   // import Tone from "../test/Tone";

   let template = document.createElement("template");
   template.innerHTML = `
	<style></style>
	<button>Start</button>
`;
   class StartContext extends HTMLElement {
     static get observedAttributes() {
       return ["disabled"];
     }
     constructor() {
       super();
       let shadowRoot = this.attachShadow({ mode: "open" });
       shadowRoot.appendChild(template.content.cloneNode(true));
       var that = this;
       this.shadowRoot.querySelector("button").onclick = async function () {
         if (window.Tone) await window.Tone.start();

         this.disabled = true;
         that.dispatchEvent(
           new CustomEvent("audioStarted") //, { tone: Tone, ctx: window.g_audioctx })
         );
       };
     }
     connectedCallBack() {}

     attributeChangedCallback(name, oldValue, newValue) {
       if (name == "disabled") {
         this.shadowRoot
           .querySelector("button")
           .setAttribute("disabled", newValue);
       }
     }
   }

   window && window.customElements.define("start-context", StartContext);

   class ToneSlider extends litElement.LitElement {

   	static get properties(){
   		return {
   			min : { type : Number },
   			max : { type : Number },
   			step : { type : Number },
   			value : { type : Number },
   			default : { type : Number },
   			exp : { type : Number },
   			anchor : { type : String },
   			label : { type : String },
   			units : { type : String },
   			integer : { type : Boolean },
   			attribute : { type : String },
   			bare : { type : Boolean },
   		}
   	}

   	constructor(){
   		super();
   		this.min = 0;
   		this.max = 100;
   		this.step = 1;
   		this.value = 50;
   		this.exp = 1;
   		this.anchor = 'left';
   		this.integer = false;
   		this.bare = false;
   		this._setThrottle = -1;
   	}

   	_logValue(pos){
   		const scaledPos = Math.pow(pos, this.exp);
   		const scaledMin = Math.pow(1, this.exp);
   		const scaledMax = Math.pow(101, this.exp);
   		let val = Math.scale(scaledPos, scaledMin, scaledMax, this.min, this.max);
   		if (this.integer){
   			val = Math.round(val);
   		}
   		this.value = val;
   		this.dispatchEvent(new CustomEvent('input', { composed : true, detail : this.value }));
   	}

   	_exp(val, exp){
   		const sign = Math.sign(val);
   		return sign * Math.pow(Math.abs(val), exp)
   	}

   	_logPosition(){
   		const pos = Math.scale(this.value, this.min, this.max, Math.pow(1, this.exp), Math.pow(101, this.exp));
   		return Math.pow(pos, 1/this.exp)
   	}

   	_beautifyVal(){
   		const diff = Math.abs(this.min - this.max);
   		if (diff > 10 || this.integer){
   			return this.value.toFixed(0)
   		} else if (diff > 1 && this.exp === 1){
   			return this.value.toFixed(1)
   		} else {
   			return this.value.toFixed(2)
   		}
   	}

   	_getStep(){
   		const diff = Math.abs(this.min - this.max);
   		if (diff > 10 || this.integer){
   			return 1
   		} else if (diff > 1 && this.exp === 1){
   			return 0.1
   		} else {
   			return 0.01
   		}
   	}

   	sync(tone){
   		const attr = this.attribute;
   		if (typeof tone[attr].value !== 'undefined'){
   			this.value = Math.clamp(tone[attr].value, this.min, this.max);
   		} else {
   			this.value = Math.clamp(tone[attr], this.min, this.max);
   		}
   	}

   	set(tone){
   		const attr = this.attribute;
   		if (isFinite(this.value)){
   			if (typeof tone[attr].value !== 'undefined'){
   				if (tone[attr].value !== this.value){
   					tone[attr].value = this.value;
   				}
   			} else if (tone[attr] !== this.value){
   				tone[attr] = this.value;
   			}
   		}
   	}

   	updated(changed){
   		super.updated(changed);
   		if (changed.has('value')){
   			this.dispatchEvent(new CustomEvent('change', { 
   				composed : true, 
   				detail : this.value, 
   				bubbles : true,
   			}));
   			if (this.attribute){
   				this.dispatchEvent(new CustomEvent(this.attribute, { 
   					composed : true, 
   					detail : this.value, 
   					bubbles : true,
   				}));
   			}
   		}
   	}

   	_numberInput(e){
   		const val = Math.clamp(parseFloat(e.target.value), this.min, this.max);
   		if (this.integer){
   			this.value = Math.floor(val);
   		} else {
   			this.value = val;
   		}
   	}

   	render(){
   		const logPos = Math.clamp(this._logPosition(), 0, 100);
   		let fillWidth = logPos-1;
   		let anchorLeft = 0;
   		if (this.anchor === 'center'){
   			anchorLeft = 50 - Math.max(50 - fillWidth, 0);
   			fillWidth = Math.abs(50 - fillWidth);
   		}
   		return litElement.html`
			<style>
				${sliderStyle}
			</style>
			<div id="container" @keydown=${e => e.key === 'Backspace' && typeof this.default !== 'undefined' ? this.value = this.default : '' }>
				<label ?hidden=${this.bare} for="value">${this.label}</label>
				<span ?hidden=${this.bare} id="units">${this.units}</span>
				<input ?hidden=${this.bare} name="value" type="number"
					@change=${this._numberInput.bind(this)}
					.min=${this.min}
					.max=${this.max}
					.step=${this._getStep()}
					.value=${this._beautifyVal()}>
				<div id="slider">
					<input name="value" type="range"
						@input=${e => this._logValue(parseFloat(e.target.value))}
						min="1"
						max="101"
						.step=${Math.pow(this.step, 1/this.exp)}
						@focus=${() => this.shadowRoot.querySelector('#circle').classList.add('focus')}
						@blur=${() => this.shadowRoot.querySelector('#circle').classList.remove('focus')}
						.value=${logPos}>
					<div id="line">
						<div id="anchor" class=${this.anchor} style="width:${fillWidth.toString()}%; left:${anchorLeft.toString()}%"></div>
					</div>
					<div id="circle" style="left: calc(${(logPos-1).toString()}% - ${(12*(logPos-1) / 100).toString()}px);"></div>
				</div>
			</div>
		`
   	}

   }

   customElements.define('tone-slider', ToneSlider);

   exports.PianoKeyboard = PianoKeyboard;
   exports.StartContext = StartContext;
   exports.ToneSlider = ToneSlider;

   Object.defineProperty(exports, '__esModule', { value: true });

})));

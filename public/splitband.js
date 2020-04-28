import { selector, slider,numeric} from "./functions.js";
import {Q,HZ_LIST, DEFAULT_PRESET_GAINS} from './constants.js';
import Presets from './presets.js'

class Band {


  constructor(input, output, minFrequency, maxFrequency, options) {
    this.input = input;
    this.output = output;
    const gctx = window.g_audioCtx;
    const params =options || {};
    this.currentVolume = 0;
    this.muted = true;
    this.mic_check = false;
    this.ledIndicator = { color: "gray", bars: 0 };

    this.minFrequency = minFrequency;
    this.maxFrequency = maxFrequency;

    if (minFrequency !== null) {
      this.hpf = gctx.createBiquadFilter();
      this.hpf.type = 'highpass';
      this.hpf.frequency.setValueAtTime(minFrequency, 0);
      this.hpf.Q.setValueAtTime(9,0);
    }
    this.maxFrequency = maxFrequency;
    if (maxFrequency !== null) {
      this.lpf = gctx.createBiquadFilter();
      this.lpf.type = 'lowpass';
      this.lpf.frequency.setValueAtTime(maxFrequency, 0);
      this.lpf.Q.setValueAtTime(9,0);

    }


    this.mainFilter = gctx.createBiquadFilter();
    if(this.minFrequency === null && this.maxFrequency === null){
      this.mainFilter.type = 'allpass';
    }else if(this.minFrequency === null){
      this.mainFilter.type= 'highshelf';
      this.mainFilter.frequency.setValueAtTime(this.maxFrequency, gctx.currentTime+0.0001);
    }else if(this.maxFrequency === null){
      this.mainFilter.type= 'lowshelf';
      this.mainFilter.frequency.setValueAtTime(this.minFrequency, gctx.currentTime+0.0001);
    }else{
      this.mainFilter.type = 'peaking';
      this.mainFilter.frequency.setValueAtTime( (this.maxFrequency - this.minFrequency)/2, gctx.currentTime+0.0001);
    }

    this.mainFilter.gain.setValueAtTime(this.mainFilter.gain.defaultValue, gctx.currentTime+0.0001);
    this.mainFilter.Q.setValueAtTime(this.mainFilter.gain.defaultValue, gctx.currentTime+0.0001);   
    
     this.volumeCap = gctx.createGain();
    this.mic_check = false;

    this.compressor = gctx.createDynamicsCompressor();
    const compressionDefaults = { 'threshold': -80, 'knee': 30, 'ratio': 12, 'attack': 0.03, 'release': 0.03 };

    this.compressor.threshold.setValueAtTime(-90,  gctx.currentTime+0.0001);
    this.compressor.attack.setValueAtTime(0.03,  gctx.currentTime+0.0001);
    this.compressor.release.setValueAtTime(0.03, gctx.currentTime+0.0001);
    this.compressor.ratio.setValueAtTime(12, gctx.currentTime+0.0001);

    this.feedbackDelay = gctx.createDelay();
    this.feedbackDelay.delayTime.setValueAtTime(0.00, gctx.currentTime);
  
    this.feedbackGain = gctx. createGain();
    this.feedbackGain.gain.setValueAtTime(-0.2,  gctx.currentTime);

    this.feedbackLPF = gctx.createBiquadFilter();
    this.feedbackLPF.type='lowpass';
    this.feedbackLPF.frequency.setValueAtTime(11,  gctx.currentTime);

    // this.lpf && cursor.connect(this.lpf) && (cursor = this.lpf);
    // this.hpf && cursor.connect(this.hpf) && (cursor = this.hpf);
    this.analyzerNode = gctx.createAnalyser();
    this.analyzerNode.fftSize=1024;
    


    
    this.compressor.connect(this.mainFilter).connect(this.analyzerNode);
    // if(input) input.connect(this.compressor)
    // if(output!==null) this.analyzerNode.connect(output)


    return this;

  }
	connect = (audioNode) =>{
    this.analyzerNode.connect(audioNode);
  }
  // probe = (evt)=>{
  //   if(this.muted === true){
	//     this.analyzerNode.connect(this.output);
  //   	if(window.g_request_timer) cancelAnimationFrame(g_request_timer);
  //   	histogram2("band_freq_out",this.analyzerNode, this.maxFrequency);
	//     evt.target.innerHTML = 'disconnect';
	//     this.muted=false;
  //   }else{
	//     this.muted=true;
	//     this.analyzerNode.disconnect();
  //       if(window.g_request_timer) cancelAnimationFrame(g_request_timer);
  //       evt.target.innerHTML = 'connect';	
  //    }
  // }

  get components() {
    return {
      mainFilter: this.mainFilter,
      compressor: this.compressor,
      feedbackDelay: this.feedbackDelay,
      feedbackLPF: this.feedbackLPF,
      phaseshift: this.phaseshift,
      volumeCap: this.volumeCap,
      analyzer: this.analyzerNode
    }
  }
  get state() {
    return [this.currentVolume, this.isMuted, this.mic_check, this.ledColor, this.ledBars];
  }
}

export function split_band(ctx, hz_list) {
  var input = ctx.createGain();
  input.gain.setValueAtTime(1.2, ctx.currentTime+0.1);
 
  var output = ctx.createGain();
  output.gain.setValueAtTime(1.2, ctx.currentTime+0.1);
  window.gctx = window.g_audioCtx;
  var bands = [];
  // bands.push(new Band(input, output,null,null));
  var mode = $("#mode_parallel") && $("#mode_parallel").checked===true || "series";
	if(mode=='series'){
    var c = input;
    hz_list.forEach((hz,index)=>{
      if(index==0){
        bands.push(new BiquadFilterNode(ctx,{type:"highshelf", frequency:hz, gain:1, Q:1}));
      }else{
        bands.push(new BiquadFilterNode(ctx,{type:"peaking", frequency:hz, gain:1, Q:1}));
      } 
      c.connect(bands[index]);
      c = bands[index];
    });
    c.connect(output);
  }else{
    input.connect(output);
    hz_list.forEach((hz,index)=>{
      if(index==0){
        bands.push(new Band(input, output, null, hz));
      }else{
        bands.push(new Band(input, output, hz_list[index-1], hz));
      }
    })
    bands.push(new Band(input,output, hz_list[hz_list.length-1], null));
  }



  function UI_Canvas(){

    const width = 690;
    const height = 320;
  
    const marginleftright = 10;
    const hz_20_mark = 10;
    const hz_20k_mark = 683;
    const width_per_octave  = [hz_20k_mark - hz_20_mark] / 4;
    const width_within_octave = [40, 28, 23, 18, 14, 14, 10, 19]  /* dogma */

    
    var canvas = document.createElement("canvas");
    canvas.setAttribute('id', "c2_freq");
    canvas.setAttribute("width", width + 2*marginleftright);
    canvas.setAttribute("height", height);
  
    const bg_color = 'rgb(33,33,35)';
    const cvt = canvas.getContext('2d');
    cvt.fillStyle = bg_color;
    cvt.fillRect(10, 0, width,height );
    cvt.strokeStyle = 'rgb(255, 255,255)'
    cvt.strokeWidth = '2px'
    for(let x = hz_20_mark; x <= hz_20k_mark; x+= width_per_octave){
      cvt.strokeWidth = '2px'
      cvt.strokeStyle = 'rgb(255, 255,255)'
  
      cvt.beginPath();
      cvt.moveTo(x,22);
      cvt.lineTo(x,height);
      cvt.stroke();
      var x_ = x;
      for(let i = 1; i<7; i++){
        cvt.strokeStyle = 'rgb(66, 66,66)'
  
        cvt.strokeWidth = '1px'
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
  function probe(index){
    var analyzer=window.g_audioCtx.createAnalyser();
    bands[index].disconnect();
    bands[index].connect(analyzer);
    if(index < bands.length-1){
       analyzer.connect(bands[index+1]);
    }else{
      analyzer.connect(output);
    }
   // histogram2(elemId, analyzer, fc)
    histogram2("band_freq_out",analyzer);
  }
  function UI_EQ(bandpassFilterNode){
    // <div> <button id='reset'>reset</button></div> <select id=preset_options></select>
    var cp =  document.createElement("div");

    var presetOptions= document.createElement("select");
    presetOptions.innerHTML = Presets.menu();
    presetOptions.oninput = function (e) {
      var name = e.target.value;
      var gains = Presets.presetGains(name);
      bandpassFilterNode.port.postMessage({
        gainUpdates: gains.map((gain, index) => {
          return { index: index, value: gain }
        })
      });
    }

    cp.appendChild(presetOptions);

    cp.appendstr("<input type=checkbox id=mode_parallel>paralell mode</input>");
    const table = document.createElement("table");

    const header = document.createElement("tr");
    header.innerHTML=`<tr><td>hz</td><td>gain</td>
    <td>type</td><td>gain</td> <td>rolloff (Q)</td><td>detune</td>
    <td>opts</td></tr>`;
    table.appendChild(header);
    
    var gvctrls =  document.createElement("div");
    slider(gvctrls, {prop: input.gain, min:"0", max: "4", name: "preamp"});
    slider(gvctrls, {prop: output.gain, min:"0", max: "4", name:"postamp"});
    
    bands.forEach( (band,index)=>{
      const row = document.createElement("tr")
      row.innerHTML+=`<td>${band.frequency.value}</td>`;

slider(row, {className:'bandpass', value: Object.values(DEFAULT_PRESET_GAINS)[index], min:"-12",max:"12",oninput:function(e){
        bandpassFilterNode.port.postMessage({
          gainUpdate:{ index: index, value: e.target.value }
        });
      }})
      // slider(row,  {prop: band.compressor.threshold, min:-100, max: 0, step:1, index:index});  
      // row.innerHTML +="<td><label>"+ band.mainFilter.type+"</label></td>"
      selector(row, {prop: band.type, options: ["allpass" , "bandpass" , "highpass" , "highshelf" , "lowpass" , "lowshelf" , "notch" , "peaking"]})
      slider(row, {prop: band.gain, min:-12, max: 12, step:0.1, index:index}); 
      slider(row, {prop: band.Q, min:0.01, max:22, step:0.1, index:index}); 
      slider(row, {prop: band.detune, min:0.0, max:0.5, step:"0.01", index:index}); 
      var button = document.createElement("button");
      button.innerHTML='connect';
      button.onclick = (e)=>{probe(index)};
      row.appendChild(button.wrap("td"));  
      
      table.appendChild(row);
    })

    cp.appendChild(gvctrls);
    cp.append(table);
    
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
  const hz_20_mark = 10;
  const hz_20k_mark = 683;

  canvas.setAttribute("width", width + 2*marginleftright);
  canvas.setAttribute("height", height);

  const bg_color = 'rgb(33,33,35)';
  const cvt = canvas.getContext('2d');
  cvt.fillStyle = bg_color;
  cvt.fillRect(10, 0, width,height );
  cvt.strokeStyle = 'rgb(255, 255,255)'
  cvt.strokeWidth = '2px'
  const noctaves = 11;
  var map = []


  var dataArray = new Uint8Array(analyzer.fftSize);

  const drawTick = function(x,f , meta){
        cvt.strokeStyle = 'rgb(255, 255,255)';
        cvt.moveTo(x, 30);
        cvt.lineTo(x, height);
        cvt.stroke();

        cvt.textAlign = "center";
        cvt.strokeText(f.toFixed(0) + "Hz", x, 20);
        cvt.strokeText(meta, width-20, 20);
  }      
  const bin_number_to_freq = (i)=> 0.5 * gctx.sampleRate * i/analyzer.frequencyBinCount;
  //HZ_LIST
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
          drawTick(x,  HZ_LIST[hz_mark_index], '');
          
        }
        var barWidth = hz_mark_index < 2 ? 10*linerBarWidth : (hz_mark_index <  7 ? 5 * linerBarWidth : linerBarWidth/2);
        var barHeight = dataArray[i] * zoomScale;

        cvt.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';

        cvt.fillRect(x,height-barHeight/2-25, barWidth, (barHeight/2));
        x += barWidth;  
                  
      }
  }

  drawBars();
}

import { selector, slider,numeric} from "./functions.js";

class Band {


  constructor(input, output, minFrequency, maxFrequency, options) {
    this.input = input;
    this.output = output;
    const gctx = input.context;
    window.gctx = gctx;
    const params =options || {};
    this.currentVolume = 0;
    this.isMuted = false;
    this.mic_check = false;
    this.ledIndicator = { color: "gray", bars: 0 };

    this.minFrequency = minFrequency;
    this.maxFrequency = maxFrequency;

    if (minFrequency !== null) {
      this.hpf = gctx.createBiquadFilter();
      this.hpf.type = 'highpass';
      this.hpf.frequency.setValueAtTime(minFrequency, 0);
    }
    this.maxFrequency = maxFrequency;
    if (maxFrequency !== null) {
      this.lpf = gctx.createBiquadFilter();
      this.lpf.type = 'lowpass';
      this.lpf.frequency.setValueAtTime(maxFrequency, 0);
    }


    this.mainFilter = gctx.createBiquadFilter();
    if(this.minFrequency === null){
      this.mainFilter.type= 'highshelf';
      this.mainFilter.frequency.setValueAtTime(this.maxFrequency, gctx.currentTime);
    }else if(this.maxFrequency === null){
      this.mainFilter.type= 'lowshelf';
      this.mainFilter.frequency.setValueAtTime(this.minFrequency, gctx.currentTime);
    }else{
      this.mainFilter.type = 'peaking';
      this.mainFilter.frequency.setValueAtTime( (this.maxFrequency - this.minFrequency)/2, gctx.currentTime);
    }
    this.mainFilter.gain.setValueAtTime(this.mainFilter.gain.defaultValue, gctx.currentTime);
    this.mainFilter.Q.setValueAtTime(this.mainFilter.gain.defaultValue, gctx.currentTime);   
    
    this.volumeCap = gctx.createDynamicsCompressor();
    this.volumeCap.threshold.setValueAtTime(0, 0);
    this.volumeCap.attack.setValueAtTime(0,0);
    this.volumeCap.release.setValueAtTime(0,0)
    this.volumeCap.ratio.setValueAtTime(20,0)
    this.mic_check = false;

    this.compressor = gctx.createDynamicsCompressor();
    const compressionDefaults = { 'threshold': -80, 'knee': 30, 'ratio': 12, 'attack': 0.03, 'release': 0.03 };
    this.compressor.threshold.setValueAtTime(-80, 0);
    this.compressor.attack.setValueAtTime(0.03, 0);
    this.compressor.release.setValueAtTime(0.03,0)
    this.compressor.ratio.setValueAtTime(12,0)

    this.feedbackDelay = gctx.createDelay();
    this.feedbackDelay.delayTime.setValueAtTime(0.01, 0)
    this.feedbackDampener = gctx.createGain();
    this.feedbackDampener.gain.setValueAtTime (params.feedbackAttenuate || 0.5, 0);
    this.feedbackLPF = gctx.createBiquadFilter();
    this.feedbackLPF.type='lowpass';
    this.feedbackLPF.frequency.setValueAtTime(params.feedbackLPF ||  this.feedbackLPF.frequency.defaultValue, 0);
    this.feedbackPhaseshift = gctx.createBiquadFilter();
    this.feedbackPhaseshift.type = 'allpass';

    var cursor = this.input;
    this.lpf && cursor.connect(this.lpf) && (cursor = this.lpf);
    this.hpf && cursor.connect(this.hpf) && (cursor = this.hpf);
    cursor.connect(this.mainFilter).connect(this.compressor);
    let AECInput = this.compressor;
    this.analyzerNode = gctx.createAnalyser();
    if(this.mic_check == false){
      AECInput.connect(this.output);
      AECInput.connect(this.feedbackDelay).connect(this.feedbackLPF).connect(this.output);
    }else{
      AECInput.connect(this.output)
      AECInput.connect(this.feedbackDelay).connect(this.feedbackLPF).connect(this.AECInput);
    }
    return this;
  }

  get components() {
    return {
      mainFilter: this.mainFilter,
      compressor: this.compressor,
      feedbackDelay: this.feedbackDelay,
      feedbackDampener: this.feedbackDampener,
      feedbackLPF: this.feedbackLPF,
      phaseshift: this.phaseshift,
      volumeCap: this.volumeCap,
    }
  }
  get state() {
    return [this.currentVolume, this.isMuted, this.mic_check, this.ledColor, this.ledBars];
  }
}

export function split_band(ctx, hz_list) {
  var input = ctx.createGain();
  input.gain.setValueAtTime(1.2, ctx.currentTime);
 
  var output = ctx.createGain();
  output.gain.setValueAtTime(1.2, ctx.currentTime);
  
  var bands = [];
  hz_list.forEach((hz,index)=>{
    if(index==0){
      
      bands.push(new Band(input, output, null, hz));
    }else{
      bands.push(new Band(input, output, hz_list[index-1], hz));
    }
  })
  bands.push(new Band(input,output, hz_list[hz_list.length-1], null));

  function UI_Canvas(){

    const width = 690;
    const height = 320;
  
    const marginleftright = 10;
    const hz_20_mark = 10;
    const hz_20k_mark = 683;
    const width_per_octave  = [hz_20k_mark - hz_20_mark] / 4;
    const width_within_octave = [40, 28, 23, 18, 14, 14, 10, 19]  /* dogma */
  
    var canvas = document.createElement("canvas");
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
  function UI_EQ(){

    const table = document.createElement("table");

    const header = document.createElement("tr");
    header.innerHTML=`<tr><td>hz</td>
    <td>threshold</td><td>ratio</td><td>attack</td><td>release</td>
    <td>type</td><td>gain</td> <td>rolloff (Q)</td>
    <td>delay</td><td>cutoff freq</td><td>resonance</td></tr>`;
    table.appendChild(header);
    
    var gvctrls =  document.createElement("div");
    slider(gvctrls, {prop: input.gain, min:-3, max:4});
    slider(gvctrls, {prop: output.gain, min:-3, max:4});
  

    bands.forEach( (band,index)=>{
      const row = document.createElement("tr")
      row.innerHTML+=`<td>${band.maxFrequency || band.minFrequency}</td>`;

      slider(row,  {prop: band.compressor.threshold, min:-100, max: 0, step:1, index:index});  
      numeric(row, {prop: band.compressor.ratio, min:2, max: 20, step:1, index:index});  
      numeric(row, {prop: band.compressor.attack, min:0, max: 1, defaultValue: 0.03, step:0.01, index:index});
      numeric(row, {prop: band.compressor.release, min:0, max: 1, defaultValue: 0.03, step:0.01, index:index});
      // row.innerHTML +="<td><label>"+ band.mainFilter.type+"</label></td>"
      selector(row, {prop: band.mainFilter.type, options: ["allpass" , "bandpass" , "highpass" , "highshelf" , "lowpass" , "lowshelf" , "notch" , "peaking"]})
      slider(row, {prop: band.mainFilter.gain, min:-12, max: 12, step:1, index:index}); 
      slider(row, {prop: band.mainFilter.Q, min:0.01, max:22, step:0.1, index:index}); 

      slider(row, {prop: band.feedbackDelay.delayTime, min:0, max:3, step:0.1, index:index}); 
      slider(row, {prop: band.feedbackLPF.frequency, min:20, max:1000, index:index}); 

      slider(row, {prop: band.feedbackDampener.gain, min: -1, max:1, value:0, step:0.01, index:index}); 
  
      table.appendChild(row);
    })
    var cp =  document.createElement("div");

    cp.appendChild(gvctrls);
    cp.append(table);
    
    return cp;
  }
  return {
    bands, UI_Canvas, UI_EQ, input, output
  };
}




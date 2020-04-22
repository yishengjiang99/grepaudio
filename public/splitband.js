import { selector, slider,numeric} from "./contants.js";

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
    this.incomingFilters=[];

    this.minFrequency = minFrequency;
    debugger;
    if (minFrequency !== null) {
      var hpf = gctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.setValueAtTime(minFrequency, 0);
      this.incomingFilters.push(hpf);
    }
    this.maxFrequency = maxFrequency;
    if (maxFrequency !== null) {
      this.lpf = gctx.createBiquadFilter();
     this.lpf.type = 'lowpass';
      this.lpf.frequency.setValueAtTime(maxFrequency, 0);
      this.incomingFilters.push(this.lpf);
    }


    this.mainFilter = gctx.createBiquadFilter();
    debugger;
    if(!this.minFrequency === null){
      this.mainFilter.type= 'highshelf';
      this.mainFilter.frequency.setValueAtTime(this.maxFrequency, gctx.currentTime);
    }else if(this.maxFrequency === null){
      this.mainFilter.type= 'lowshelf';

      this.mainFilter.frequency.setValueAtTime(this.minFrequency, gctx.currentTime);
    }else{
      this.mainFilter.type = 'peaking';
      this.mainFilter.frequency.setValueAtTime( (this.maxFrequency - this.minFrequency)/2, gctx.currentTime);
    }

    this.volumeCap = gctx.createDynamicsCompressor();
    this.volumeCap.threshold.setValueAtTime(params.volumeCap || 0, 0);
    this.volumeCap.attack.setValueAtTime(0,0);
    this.volumeCap.release.setValueAtTime(0,0)
    this.volumeCap.ratio.setValueAtTime(20,0)


    this.highPassFilter = minFrequency !== null ? gctx.createBiquadFilter() : null;
    this.db_gain = gctx.createGain();
    this.db_gain.gain.value = params.db_gain || 1;

    this.compressor = gctx.createDynamicsCompressor();
    const compressionDefaults = { 'threshold': -80, 'knee': 30, 'ratio': 12, 'attack': 0.03, 'release': 0.03 };
    ['threshold', 'knee', 'ratio', 'attack', 'release'].forEach(key => {
      this.compressor[key].value = compressionDefaults[key];
    });

    this.feedbackDelay = gctx.createDelay();
    this.feedbackDelay['delayTime'].value = params.feedbackDelay || 0.005;
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
      incomingFilters: this.incomingFilters,
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


export function UI_parameter_EQ(band_list){

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

export function UI_band(bands){

  const table = document.createElement("table")
  table.innerHTML 
  table.innerHTML += `<tr><td>hz</td>
  <td>threshold</td><td>ratio</td><td>attack</td><td>release</td>
  <td>type</td><td>gain</td> <td>rolloff (Q)</td>
  <td>delay</td><td>cutoff freq</td><td>resonance</td><td>lowpass</td></tr>`

  bands.forEach( (band,index)=>{
    const row = document.createElement("tr")
    row.innerHTML+=`<td>${band.maxFrequency || band.minFrequency}</td>`;
    slider(row, {prop: band.compressor.threshold, min:-100, max: 0, step:1, index:index});  
    numeric(row, {prop: band.compressor.ratio, min:2, max: 20, step:1, index:index});  
    numeric(row, {prop: band.compressor.attack, min:0, max: 1, defaultValue: 0.03, step:0.01, index:index});
    numeric(row, {prop: band.compressor.release, min:0, max: 1, defaultValue: 0.03, step:0.01, index:index});
    row.innerHTML +="<td><label>"+ band.mainFilter.type+"</label></td>"
    //selector(row, {prop: band.mainFilter.type, options: ["allpass" , "bandpass" , "highpass" , "highshelf" , "lowpass" , "lowshelf" , "notch" , "peaking"]})
    slider(row, {prop: band.mainFilter.gain, min:-12, max: 12, step:1, index:index}); 
    slider(row, {prop: band.mainFilter.Q, min:0.01, max:22, step:0.1, index:index}); 
    slider(row, {prop: band.feedbackDelay.delayTime, type:"numeric", min:0, max:3, step:0.1, index:index}); 
    numeric(row, {prop: band.feedbackDampener.gain, min:0, max:0.7, value:0.3, index:index}); 
    slider(row, {prop: band.feedbackLPF.frequency,min:20, max:1000, index:index}); 

    table.appendChild(row);
  })

  
  return table;
}

export function split_band(input, output, hz_list) {
  var ctx = input.context;

  var output = ctx.destination;
  var bands = [];
  hz_list.map((hz,index)=>{
    if(index==0){
      bands.push(new Band(input, output, null, hz));
    }else if (index == hz_list.length -1){
      bands.push(new Band(input, output, hz, null));
    }else{
      bands.push(new Band(input, output, hz_list[index-1], hz));
    }
  })
  return bands;
}




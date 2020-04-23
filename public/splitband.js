import { selector, slider,numeric} from "./functions.js";
import {Q,HZ_LIST, DEFAULT_PRESET_GAINS} from './constants.js';
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
    
     this.volumeCap = gctx.createGain();
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
    this.analyzerNode.fftSize=64;
    if(this.mic_check == false){
      AECInput.connect(this.volumeCap);
      AECInput.connect(this.feedbackDelay).connect(this.feedbackLPF).connect(this.volumeCap);
    }else{
      AECInput.connect(this.volumeCap)
      AECInput.connect(this.feedbackDelay).connect(this.feedbackLPF).connect(this.AECInput);
    }
    this.volumeCap.connect(this.analyzerNode)
    this.analyzerNode.connect(this.output);
    return this;
  }
  probe = ()=>{
    histogram2("band_freq_out",this.analyzerNode);
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
      analyzer: this.analyzerNode
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
  function probe(hz){
    var analyzers;
    for(let i in bands){
      if( band.maxFrequency > hz ) {
        analyzders = bands[i].probe(); break;;
      }
    }
    analyzers = bands[bands.length-1].probe()
    analyzers[1].histogram("band_freq_out");

    return bands[bands.length-1].probe();
  }
  function UI_EQ(){

    const table = document.createElement("table");

    const header = document.createElement("tr");
    header.innerHTML=`<tr><td>hz</td>
    <td>threshold</td>
    <td>type</td><td>gain</td> <td>rolloff (Q)</td>
    <td>delay</td><td>cutoff freq</td><td>resonance</td><td>opts</td></tr>`;
    table.appendChild(header);
    
    var gvctrls =  document.createElement("div");
    slider(gvctrls, {prop: input.gain, min:"0", max: "4", name: "preamp"});
    slider(gvctrls, {prop: output.gain, min:"0", max: "4", name:"postamp"});
  

    bands.forEach( (band,index)=>{
      const row = document.createElement("tr")
      row.innerHTML+=`<td>${band.maxFrequency || band.minFrequency}</td>`;

      slider(row,  {prop: band.compressor.threshold, min:-100, max: 0, step:1, index:index});  
      // row.innerHTML +="<td><label>"+ band.mainFilter.type+"</label></td>"
      selector(row, {prop: band.mainFilter.type, options: ["allpass" , "bandpass" , "highpass" , "highshelf" , "lowpass" , "lowshelf" , "notch" , "peaking"]})
      slider(row, {prop: band.mainFilter.gain, min:-12, max: 12, step:1, index:index}); 
      slider(row, {prop: band.mainFilter.Q, min:0.01, max:22, step:0.1, index:index}); 

      slider(row, {prop: band.feedbackDelay.delayTime, min:0, max:3, step:0.1, index:index}); 
      slider(row, {prop: band.feedbackLPF.frequency, min:20, max:1000, index:index}); 

      slider(row, {prop: band.feedbackDampener.gain, min: -1, max:1, value:0, step:0.01, index:index}); 
      var button = document.createElement("button");
      button.innerHTML='probe';
      button.onclick = band.probe;
      row.appendChild(button.wrap("td"));  
      
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




function histogram2(elemId, analyzer){
      var bins = analyzer.fftSize;
      var zoomScale=1;
      var canvas = document.getElementById(elemId);
      const width = 690;
      const height = 320;
    
      const marginleftright = 10;
      const hz_20_mark = 10;
      const hz_20k_mark = 683;
      const width_per_octave  = [hz_20k_mark - hz_20_mark] / 4;
      const width_within_octave = [40, 28, 23, 18, 14, 14, 10, 19]  /* dogma */
    
      canvas.setAttribute("width", width + 2*marginleftright);
      canvas.setAttribute("height", height);
    
      const bg_color = 'rgb(33,33,35)';
      const cvt = canvas.getContext('2d');
      cvt.fillStyle = bg_color;
      cvt.fillRect(10, 0, width,height );
      cvt.strokeStyle = 'rgb(255, 255,255)'
      cvt.strokeWidth = '2px'
      const noctaves = 11;
      for (var octave = 0; octave <= noctaves; octave++) {
        var x = octave * width / noctaves;
  
        cvt.strokeStyle = 'rgb(255, 255,255)';
        cvt.moveTo(x, 30);
        cvt.lineTo(x, height);
        cvt.stroke();
  
        var f = 0.5 * gctx.sampleRate * Math.pow(2.0, octave - noctaves);
        cvt.textAlign = "center";
        cvt.strokeText(f.toFixed(0) + "Hz", x, 20);
      }

      var dataArray = new Uint8Array(analyzer.fftSize);

      
      function drawBars(){
          var t = requestAnimationFrame(drawBars);;

          analyzer.getByteFrequencyData(dataArray);

          var top, second, third;
          var count=0;
          var total =0;
          dataArray.reduce(d=> total+=d);
          
          cvt.fillStyle = 'rgb(0, 0, 0)';
          cvt.clearRect(0, 0, width, height);
          cvt.fillRect(0, 0, width, height);

          var barHeight;
          var barHeigthCC;
          var x = 0;
          for(var i = 0; i < bins/zoomScale; i++) {
            var barWidth = 1/i;

            barHeight = dataArray[i] * zoomScale

            cvt.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';

            cvt.fillRect(x,height-barHeight/2-25,barWidth,(barHeight/2));

            cvt.fillStyle = 'rgb(22, 22,'+(barHeigthCC+44)+')';

            x += barWidth + 1;
          }

          cvt.fillStyle= 'rgb(233,233,233)'
          cvt.fillText(zoomScale, 0, height-5);

          x=10;
          var axisIndex=0;
          for(var i = 0; i < bins/zoomScale; i++) {
          
            barHeight = dataArray[i];
            cvt.fillStyle= 'rgb(233,233,233)'
            cvt.textAlign ='left'
            var f = (i+1)/bins * gctx.sampleRate;
            var x = 2*Math.log10(f);
      

            x += barWidth + 1;
          }      
          cvt.fillText(total.toFixed(3)+'', width-100, 100);
      }

      drawBars();
    }

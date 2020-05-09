import EventEmitter from './EventEmitter.js';


export default function Draw_EQ(ctx, filters) {
  const nyquist = ctx.sampleRate/2
  var dbScale = 32;
  var canvas = document.querySelectorAll('#geq canvas')[0];
  var histogram = document.querySelectorAll('#eq canvas')[1];
  var vtx = canvas.getContext('2d');

  var width_plus_margins = Math.max(800, canvas.parentElement.clientWidth);
  var height_plus_margins = Math.max(500,canvas.parentElement.clientHeight);
  canvas.setAttribute('width', canvas.parentElement.clientWidth);
  canvas.setAttribute('height', canvas.parentElement.clientHeight);

  const width = width_plus_margins - 30;
  const height = height_plus_margins - 30;
  const margin_top = 15;
  const margin_left = 15;
  var pixelsPerDb = (0.5 * height) / dbScale;
  console.log(pixelsPerDb,'pixelsPerDb')
  var filterIndexInFocus = -1;
  var centerFreqKnobs = Array()

  const noctaves = 11;
  var shiftup = 0;
  var dirty = true;
  var canvas_zoomscale = 1;
  const freqs = calcNyquists(width); //a list of frequecies each pixel on x-axis represent.. i know..

  function xToFreq(x) {
    return freqs[x];
  }
  function YToDb(y) {
    var db = (0.5 * height - (y - shiftup) / canvas_zoomscale) / pixelsPerDb;
    return db;
  }
  function dbToY(db) {
    var y = ((0.5 * height-margin_top) - pixelsPerDb * db) * canvas_zoomscale + shiftup;
    return y;
  }
  var dsp_lock = 0;

 drawFrequencyResponses();

  function drawFrequencyResponses(){
    dsp_lock =1;
    
    if(dsp_lock ==1); return;
    if( request_dsp_L.dsp_loc>4){
      pause
    }
    requestAnimationFrame(call_canvas)
    dsp_lock = dsp_lock = 0;
  }



  function call_canvas(){
    vtx.clearRect(margin_left, margin_top, width, height);
    vtx.fillStyle = 'black'
    vtx.fillRect(0, 0, width_plus_margins, height_plus_margins);

    // Draw frequency scale.
    var curveColor = "rgb(192,192,192)";
    var curveColorSubbands = "rgb(192,192,192,0.4)";

    var playheadColor = "rgb(80, 100, 80)";
    var gridColor = "rgb(100,100,100)";
    // Draw 0dB line.
    // vtx.strokeStyle=gridColor;
    vtx.beginPath();
    vtx.moveTo(0, 0.5 * height);
    vtx.lineTo(width, 0.5 * height);
    vtx.stroke();
    for (var octave = 0; octave <= noctaves; octave++) {
      var x = octave * width / noctaves + margin_left;
      vtx.strokeStyle = gridColor;
      vtx.moveTo(x, 30);
      vtx.lineTo(x, height);
      vtx.stroke();
      var f = ctx.sampleRate / 2 * Math.pow(2.0, octave - noctaves);
      vtx.textAlign = "center";
      vtx.strokeStyle = curveColor;
      vtx.strokeText(f.toFixed(0) + "Hz", x, 20);
    }
    const canvasContext = vtx;
    for (var db = -dbScale; db < dbScale; db += 5) {
      var y = dbToY(db);
      canvasContext.strokeStyle = curveColor;
      canvasContext.strokeText(db.toFixed(0)-35 + "dB", width - 40, y);
      canvasContext.strokeStyle = gridColor;
      canvasContext.beginPath();
      canvasContext.moveTo(0, y);
      canvasContext.lineTo(width, y);
      canvasContext.stroke();
    }

    var cc = ['blue', 'red', 'green'];
    var magResponse = new Float32Array(freqs.length);
    var phaseResponse = new Float32Array(freqs.length);
    var aggregate = new Float32Array(freqs.length).fill(0);
    var knobRadius = 5;
  
      vtx.strokeWidth = '1px';
  //  vtx.clearRect(0,0,width,height)
    var centerFreqXMap={};
    for (let i in filters) {
      const filter = filters[i]
      vtx.beginPath();
      vtx.moveTo(0, height);

      if (centerFreqKnobs[i] === null ||  dirty == true) {
        filter.getFrequencyResponse(freqs, magResponse, phaseResponse);
        for (var k = 0; k < width; ++k) {
          db = 20.0 * Math.log(magResponse[k]) / Math.LN10;
          var phaseDeg = 180 / Math.PI * phaseResponse[k];
          var realdb = db;//db * Math.cos(phaseDeg);
          aggregate[k] += realdb;
          let y = dbToY(realdb)
          vtx.lineTo(k, dbToY(realdb));
          if (k>0 && freqs[k] > filter.frequency.value && freqs[k-1] < filter.frequency.value ) {

            centerFreqKnobs[i] = [k, y];
            centerFreqXMap[i] = i;
          }
        }
      }
      vtx.lineTo(width,height);
      vtx.lineTo(0,height)
      vtx.stroke();
      if (i == filterIndexInFocus) {
        vtx.fillStyle = `rgb(211,211,211,0.1)`;
        vtx.fill();
      }else{
        vtx.fillStyle = `rgb(111,111,111,0.05)`;
        vtx.fill();

      }

    }
  

    const knobcolors = ['blue','red','green','white','grey'];
    for (let i = 0; i < centerFreqKnobs.length; i++) {
      const k = centerFreqKnobs[i][0];
    
      const y = centerFreqKnobs[i][1];
      vtx.beginPath();
  
      vtx.arc(k-knobRadius, y-knobRadius, knobRadius, 0, Math.PI * 2, false);
      vtx.fillStyle=knobcolors % i ;
      vtx.fill();

      vtx.closePath();
    }

    vtx.beginPath();
    vtx.strokestyle = '3px';
    vtx.moveTo(0,height);
    for (var k = 0; k < width; ++k) {
      var y = dbToY(aggregate[k])

      vtx.lineTo(k, y);

    }
    vtx.lineTo(width,height);
    vtx.moveTo(0,height);
    vtx.stroke();
    vtx.closePath();
    vtx.stroke();
    vtx.fillStyle=''
    // vtx.fill();
    dirty = false;
  }

  var filterIndexInFocus = -1;
  var lastClick;
  canvas.ondblclick = function (e) {
    log(" time sinze last click " + (ctx.currentTime - lastClick));
    if (filterIndexInFocus > -1) {
       filters[filterIndexInFocus].gain.setValueAtTime(YToDb(e.offsetY), ctx.currentTime);

      dirty = true;
      drawScalesAndFrequencyResponses();
    }
  }
  var mousedown = false;
  canvas.onmousedown = function (e) {
    mousedown = true;
  }
  canvas.onmouseup = function (e) {
    mousedown = false;
  }

  canvas.onmousemove = function (e) {
    if (mousedown === true && filterIndexInFocus > -1) {
      if (e.movementY * e.movementY > 25) {
        var currentQ = filters[filterIndexInFocus].Q.value;
        var targetQ;
        if (e.offSetY > 0) targetQ = currentQ * 1.02;
        else targetQ = currentQ * 0.97;
        filters[filterIndexInFocus].gain.setTargetAtTime(YToDb(e.offsetY), ctx.currentTime + 0.001, 0.001);
        filters[filterIndexInFocus].Q.setTargetAtTime(targetQ, ctx.currentTime + 0.001, 0.001);
      }
      if (e.movementX * e.movementX > 10) {

        filters[filterIndexInFocus].frequency.setTargetAtTime(xToFreq(e.offsetX), ctx.currentTime + 0.001, 0.001);
      }
      dirty = true;
      drawFrequencyResponses();

    }else{
      focusClosest(e);
    }

  }


  var filterIndexInFocus = -1;
  var lastClick;

  canvas.ondblclick = function (e) {
    log(" time sinze last click " + (ctx.currentTime - lastClick));
    if (filterIndexInFocus > -1) {
      let cval = filters[filterIndexInFocus].gain.value;
      filters[filterIndexInFocus].gain.setValueAtTime(YToDb(e.offsetY), ctx.currentTime);

      dirty = true;
      drawFrequencyResponses();
    }
  }
  var mousedown = false;
  canvas.onmousedown = function (e) {
    mousedown = true;
  }
  canvas.onmouseup = function (e) {
    mousedown = false;
  }
  canvas.onmousemove = function (e) {
    if( mousedown === false)     focusClosest(e);

    if (mousedown === true && filterIndexInFocus > -1) {

      if (e.movementY * e.movementY > 25) {
        var currentQ = filters[filterIndexInFocus].Q.value;
        var targetQ;
        if (e.offSetY > 0) targetQ = currentQ * 1.02;
        else targetQ = currentQ * 0.97;


        filters[filterIndexInFocus].gain.setTargetAtTime(YToDb(e.offsetY), ctx.currentTime + 0.001, 0.001);
        filters[filterIndexInFocus].Q.setTargetAtTime(targetQ, ctx.currentTime + 0.001, 0.001);

      }
      if (e.movementX * e.movementX > 10) {

        filters[filterIndexInFocus].frequency.setTargetAtTime(xToFreq(e.offsetX), ctx.currentTime + 0.001, 0.001);
      }
      dirty = true;
      drawFrequencyResponses();
    }
  }
    //  e.offsetX;

    function focusClosest(e) {
      const mousex = e.offsetX;
      var lastFocus = filterIndexInFocus;
      var closest = width;
      lastClick = ctx.currentTime;
      for (let i in centerFreqKnobs) {
        if (Math.abs(centerFreqKnobs[i][0] - mousex) < closest) {
          filterIndexInFocus = i;
          closest = Math.abs(centerFreqKnobs[i][0] - mousex);
        }
      }
      if (filterIndexInFocus !== lastFocus) {
        dirty = true;
        drawFrequencyResponses();
      }
    }
    console.log(centerFreqKnobs);


    // log(freqs);
    canvas.addEventListener('wheel', function (event) {
      event.preventDefault();

      if (event.deltaY < 0) {
        console.log('scrolling up');
        if (canvas_zoomscale < 3) canvas_zoomscale += 0.05;
        dirty = true;
        drawFrequencyResponses();
      }
      else if (event.deltaY > 0) {
        if (canvas_zoomscale > 0.5) canvas_zoomscale -= 0.05;
        dirty = true;
        drawFrequencyResponses();
        console.log('scrolling down');
      }
    });

    function calcNyquists(width) {
      var freq = new Float32Array(width);
      for (var k = 0; k < width; ++k) {
        var f = k / width;
        f = Math.pow(2.0, noctaves * (f - 1.0));
        freq[k] = f * nyquist;
      }
      window.allfreqs = freq;
      return freq;
    }

    function drawOverlayFrequencies(analyzer){
      var data =new Float32Array(1024);
      const pixel_to_hz_map = window.allfreqs 
  
      const bin_number_to_freq = (i) => 0.5 * analyzer.context.sampleRate * i / analyzer.frequencyBinCount;
    
      const freq_to_x = (freq, hint)=>{
        let k = hint || 2;
        while(freq < pixel_to_hz_map[k]) k = k*2;
        while(freq > pixel_to_hz_map[k]) k--;  
        return k;
      }
 
      function drawFrame(){
        
        analyzer.getFloatFrequencyData( data);
        let lastk = 0;
        for(let i = 0 ; i< data.length; i++){
          var x = freq_to_x(bin_number_to_freq(i), lastk);
          let hue = i/analyzer.frequencyBinCount * 360;
          ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
          let barHeight = height/2*data[i];
          vtx.fillRect(lastk, height - barHeight, x-lastk, barHeight);
          lastk = x;
          log(lastk, height-barHeight, x-lastk,barHeight )
        }
        requestAnimationFrame(drawFrame);
      }
      drawFrame();
  
    }
  
  
    return {
      updateFilter: drawFrequencyResponses,
      drawOverlayFrequencies: drawOverlayFrequencies
    }
  }


  


  
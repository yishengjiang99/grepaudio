import {Q,HZ_LIST, DEFAULT_PRESET_GAINS} from './constants.js';

var g_av_timers = [];

var AnalyzerView = function(audioNode, params){
  const _configs = {};
  const configs =  params || _configs

  var fft = audioNode.context.createAnalyser();
  
  fft.fftSize = configs.fft || 2048;
  fft.smoothingTimeConstant = configs.smtc || 0.9;
  const bins = fft.fftSize;

  const ctx = fft.context;
  var zoomScale = 1;
  var xshift = 0;
  audioNode.connect(fft);
  var cummulativeFFT = new Uint8Array(fft.fftSize).fill(0);
  var counter = 0;
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
      }else{
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
      switch(dir){
        case 'left': xshift -= 1;
        case 'right': xshift += 1;
      }
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
    timeseries: function(elemId, sampleSize=1024, width=320, height=255){
      fft.fftSize = sampleSize;
      this.timeseries2({elemId, sampleSize, width, height, analyzer:fft});
    },
    timeseries2: function(params){
      var params = Object.assign({sampleSize:1024, width:320, height:255}, params);
      const {elemId, sampleSize, width, height, analyzer} = params;
      const HEIGHT = height;
      const WIDTH = width;
      var canvas = document.getElementById(elemId);
      const canvasCtx = canvas.getContext('2d');
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      canvas.fillStyle='rbg(0,2,2)'
      canvasCtx.lineWidth = 1;
      canvasCtx.strokeStyle = 'white';
      var dataArray = new Uint8Array(analyzer.fftSize);
      var convertY = y => y/2 + height/4;

      canvasCtx.fillRect(0,0,WIDTH,HEIGHT);

      canvasCtx.beginPath();
      canvasCtx.moveTo(0, convertY(0));
      var t = 0; 
      canvasCtx.lineWidth = 2;
      var x  = 0;
      function draw(){
              
         analyzer.getByteTimeDomainData(dataArray);
         var bufferLength = dataArray.length;

         canvasCtx.beginPath();
        
        
         for (var i = 0; i < bufferLength; i++) {
            var y = dataArray[i];
            if( Math.abs(y-127) < 2 ) continue;
              x = t / bufferLength  % width;
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
      debugger;
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
      var dataArray = new Uint8Array(fft.fftSize);
      if(!repeating) return dataArray;

      
      function drawBars(){
          var draw= !($("#showfft") && $("#showfft").checked == false)
          var draw_accum = false;!($("#showcummulative") && $("#showcummulative").checked == false)
          var t = requestAnimationFrame(drawBars);;

          fft.getByteFrequencyData(dataArray);

          var top, second, third;
          var count=0;
          var total =0;
          dataArray.reduce(d=> total+=d);
          
          
          for(let i=0; i<dataArray.length; i++){
              cummulativeFFT[i] = cummulativeFFT[i] + dataArray[i];
          }

          counter++;
          var bufferLength = dataArray.length;
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
          canvasCtx.fillText(fft.context.currentTime, 0,0, 20, 10)
          for(var i = 0; i < bins/zoomScale; i++) {
            barWidth = width/bins * 250/(30-i);

            barHeight = dataArray[i] * zoomScale
            let hue = i/fft.frequencyBinCount * 360;

            barHeigthCC = cummulativeFFT[i];
            canvasCtx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';

            if(draw) canvasCtx.fillRect(x,height-barHeight/2-25,barWidth,(barHeight/2));

            canvasCtx.fillStyle = 'rgb(22, 22,'+(barHeigthCC+44)+')';

            if(draw_accum) canvasCtx.fillRect(x,height-barHeigthCC/2-25,barWidth,(barHeigthCC/2));

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
            canvasCtx.fillStyle= 'rgb(233,233,233)'
            canvasCtx.textAlign ='left'
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
}

export default AnalyzerView;



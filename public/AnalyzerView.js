import {Q,HZ_LIST, DEFAULT_PRESET_GAINS} from './contants.js';

var AnalyzerView = function(audioNode, params){
  const _configs = {};
  const configs =  params || _configs

  var fft = audioNode.context.createAnalyser();
  
  fft.fftSize = configs.fft || 256;
  fft.minDecibels = configs.min_dec || -90;
  fft.maxDecibels = configs.max_dec || -10;
  fft.smoothingTimeConstant = configs.smtc || 0.1;
  const bins = fft.fftSize;

  const ctx = fft.context;
  var zoomScale = 2;
  var xshift = 0;
  audioNode.connect(fft);

  var cummulativeFFT = new Uint8Array(fft.fftSize).fill(0);
  var counter = 0;
  function zoomIn(){
    zoomScale += 0.1;
  }
  function zoomOut(){
    zoomScale -= 0.1;
  }
  if($("#zoomin")) $("#zoomin").onclick=zoomIn;
  if($("#zoomout")) $("#zoomout").onclick=zoomOut;

  return {
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
    timeseries: function(elemId, sampleSize=1024, width=320, height=200){
      var canvas = document.getElementById(elemId);
      const canvasCtx = canvas.getContext('2d');
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      canvasCtx.lineWidth = 1;
      canvasCtx.strokeStyle = 'rgb(122, 122, 122)';
      var dataArray = new Float32Array(sampleSize);
      
      canvasCtx.beginPath();
      canvasCtx.moveTo(0, 0);
      var x = 0; 
      function draw(){
         fft.getFloatTimeDomainData(dataArray);
         var sum = 0;
         for(let i =0; i < sampleSize; i++){
            sum += (dataArray[i] * dataArray[i]);
         }
         var rms = Math.sqrt(sum/sampleSize)*200;

         if(x >= width){
          canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            x=0;
            canvasCtx.closePath();
            canvasCtx.clearRect(0, 0, width, height);
            canvasCtx.fillRect(0, 0, width, height);
            canvasCtx.beginPath();//ADD THIS LINE!<<<<<<<<<<<<<
            canvasCtx.moveTo(0,0);
         }
         
         if(rms >0){
           canvasCtx.lineTo(x, rms);
            x++;
          canvasCtx.stroke();
         }
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
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillStyle = 'black';
      canvasCtx.fillRect(0,0,width, height);
      var dataArray = new Uint8Array(fft.fftSize);
      if(!repeating) return dataArray;


      function drawBars(){
          var draw= $("#showfft").checked;
          var draw_accum = $("#showcummulative").checked;
          requestAnimationFrame(drawBars);

          fft.getByteFrequencyData(dataArray);
          // if(dataArray.reduce(d=>sum+d, sum=0) == 0 ){
          //   return; 
          // };


          for(let i=0; i<dataArray.length; i++){
              cummulativeFFT[i] = cummulativeFFT[i] + dataArray[i];

          }

          counter++;
          var bufferLength = dataArray.length;
          canvasCtx.fillStyle = 'rgb(0, 0, 0)';
          //
            canvasCtx.clearRect(0, 0, width, height);
          canvasCtx.fillRect(0, 0, width, height);

          var barWidth = (width / (255/zoomScale)) * 2.5;
          var barHeight;
          var barHeigthCC;
          var x = 0;
          for(var i = 0; i < 255/zoomScale; i++) {
            barHeight = dataArray[i] * zoomScale

            barHeigthCC = cummulativeFFT[i];
            canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';

            if(draw) canvasCtx.fillRect(x,height-barHeight/2-25,barWidth,(barHeight/2));

            canvasCtx.fillStyle = 'rgb(22, 22,'+(barHeigthCC+44)+')';

            if(draw_accum) canvasCtx.fillRect(x,height-barHeigthCC/2-25,barWidth,(barHeigthCC/2));


            x += barWidth + 1;
          }

          canvasCtx.fillStyle= 'rgb(233,233,233)'
          canvasCtx.fillText(zoomScale, 0, height-5);

          x=10;
          var axisIndex=0;
          for(var i = 0; i < 255/zoomScale; i++) {
          
            barHeight = dataArray[i];
            canvasCtx.fillStyle= 'rgb(233,233,233)'
            canvasCtx.textAlign ='left'
            var f = i/bins  * 24000;
            if(f>HZ_LIST[axisIndex]){
              canvasCtx.fillText(HZ_LIST[axisIndex].toFixed(0)+'hz', x, height-5);
              axisIndex++;
            }

            x += barWidth + 1;
          }   

      }

      drawBars();
    }
  }
}

export default AnalyzerView;

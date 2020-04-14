var AnalyzerView = function(audioNode, params){
  const _configs = {};
  const configs =  params || _configs

  var fft = audioNode.context.createAnalyser();
  const bins = fft.fftSize;
  fft.fftSize = configs.fft || 256;
  fft.minDecibels = configs.min_dec || -90;
  fft.maxDecibels = configs.max_dec || -10;
  fft.smoothingTimeConstant = configs.smtc || 0.1;
  const ctx = fft.context;
  var zoomScale = 2;
  var xshift = 0;
  audioNode.connect(fft);

  var cummulativeFFT = new Uint8Array(fft.fftSize).fill(0);
  var counter = 0;
  return {
    analyzer:fft,
    zoomIn: function(){
      zoomScale += 0.1;
    },
    zoomOut: function(){
      zoomScale += 0.1;
    },
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

          requestAnimationFrame(drawBars);

          fft.getByteFrequencyData(dataArray);

          var maxY = 0, currentMaxY=0;

          for(let i=0; i<dataArray.length; i++){
              cummulativeFFT[i] = (cummulativeFFT[i])*.9 + dataArray[i];
              maxY = Math.max(maxY, cummulativeFFT[i]);
              currentMaxY = Math.max(currentMaxY, dataArray[i]);
          }

          counter++;
          var bufferLength = dataArray.length;
          canvasCtx.fillStyle = 'rgb(0, 0, 0)';
          //
            canvasCtx.clearRect(0, 0, width, height);
          canvasCtx.fillRect(0, 0, width, height);

          var barWidth = (width / 255) * 2.5;
          var barHeight;
          var barHeigthCC;
          var x = 0;
          for(var i = 0; i < 160; i++) {
            barHeight = dataArray[i]

            barHeigthCC = cummulativeFFT[i];
            canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';

           canvasCtx.fillRect(x,height-barHeight/2-25,barWidth,(barHeight/2));

            canvasCtx.fillStyle = 'rgb(22, 22,'+(barHeigthCC+44)+')';

           canvasCtx.fillRect(x,height-barHeigthCC/2-25,barWidth,(barHeigthCC/2));


            x += barWidth + 1;
          }

          x=3;
          for(var i = 0; i < 160; i+=20) {

            barHeight = dataArray[i];
            canvasCtx.fillStyle= 'rgb(233,233,233)'
            canvasCtx.textAlign ='left'
            var f = i/bins  * 41800;
            canvasCtx.fillText(f.toFixed(0)+'hz', x, height-5);

            x += 20*barWidth + 1;
          }

      }

      drawBars();
    }
  }
}

export default AnalyzerView;

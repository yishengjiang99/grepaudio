function visualize(canvasId,analyser,domain)
{
    var canvas = document.querySelector(canvasId);
    var canvasCtx = canvas.getContext("2d");
    canvas.setAttribute('width',canvas.parentElement.clientWidth);
    canvas.setAttribute('height',canvas.parentElement.clientHeight);
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    canvasCtx.clearRect(0,0,WIDTH,HEIGHT);

    if (domain == 'time') {
        analyser.fftSize = 2048;
        var bufferLength = 2048;
        var dataArray = new Uint8Array(bufferLength);
        var sliceWidth = WIDTH * 1.0 / bufferLength * 5;
        var drawTime = function ()
        {
            t = requestAnimationFrame(drawTime);
            analyser.getByteTimeDomainData(dataArray);
            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0,0,WIDTH,HEIGHT);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            canvasCtx.beginPath();

            var x = 0;

            for (var i = 0; i < bufferLength; i++) {

                var v = dataArray[i] / 128.0;
                var y = v * HEIGHT / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x,y);
                } else {
                    canvasCtx.lineTo(x,y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width,canvas.height / 2);
            canvasCtx.stroke();

        };
        drawTime();
    } else {
        analyser.fftSize = 256;
        var bufferLengthAlt = analyser.frequencyBinCount;
        console.log(bufferLengthAlt);
        var dataArrayAlt = new Uint8Array(bufferLengthAlt);
  
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        var drawAlt = function() {
            drawVisual = requestAnimationFrame(drawAlt);
            if(stopped) return;
    
            analyser.getByteFrequencyData(dataArrayAlt);
    
            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    
            var barWidth = (WIDTH / bufferLengthAlt) * 2.5;
            var barHeight;
            var x = 0;
    
            for(var i = 0; i < bufferLengthAlt; i++) {
              barHeight = dataArrayAlt[i];
    
              canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
              canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);
    
              x += barWidth + 1;
            }
          };
    
          drawAlt();
    }
    return t;
}


function drawCurve(canvas) {
    // draw center
    canvasContext = canvas.getContext("2d");
    
    width = canvas.width;
    height = canvas.height;

    canvasContext.clearRect(0, 0, width, height);

    canvasContext.strokeStyle = curveColor;
    canvasContext.lineWidth = 3;
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);

    pixelsPerDb = (0.5 * height) / dbScale;
    
    var noctaves = 11;
    
    var frequencyHz = new Float32Array(width);
    var magResponse = new Float32Array(width);
    var phaseResponse = new Float32Array(width);
    var nyquist = 0.5 * context.sampleRate;
    // First get response.
    for (var i = 0; i < width; ++i) {
        var f = i / width;
        
        // Convert to log frequency scale (octaves).
        f = nyquist * Math.pow(2.0, noctaves * (f - 1.0));
        
        frequencyHz[i] = f;
    }

    filter.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);

    
    for (var i = 0; i < width; ++i) {
        var f = magResponse[i];
        var response = magResponse[i];
        var dbResponse = 20.0 * Math.log(response) / Math.LN10;
        dbResponse *= 2; // simulate two chained Biquads (for 4-pole lowpass)
        
        var x = i;
        var y = dbToY(dbResponse);
        
        if ( i == 0 )
            canvasContext.moveTo(x,y);
        else
            canvasContext.lineTo(x, y);
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.lineWidth = 1;
    canvasContext.strokeStyle = gridColor;
    
    // Draw frequency scale.
    for (var octave = 0; octave <= noctaves; octave++) {
        var x = octave * width / noctaves;
        
        canvasContext.strokeStyle = gridColor;
        canvasContext.moveTo(x, 30);
        canvasContext.lineTo(x, height);
        canvasContext.stroke();

        var f = nyquist * Math.pow(2.0, octave - noctaves);
        canvasContext.textAlign = "center";
        canvasContext.strokeStyle = textColor;
        canvasContext.strokeText(f.toFixed(0) + "Hz", x, 20);
    }

    // Draw 0dB line.
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0.5 * height);
    canvasContext.lineTo(width, 0.5 * height);
    canvasContext.stroke();
    
    // Draw decibel scale.
    
    for (var db = -dbScale; db < dbScale; db += 10) {
        var y = dbToY(db);
        canvasContext.strokeStyle = textColor;
        canvasContext.strokeText(db.toFixed(0) + "dB", width - 40, y);
        canvasContext.strokeStyle = gridColor;
        canvasContext.beginPath();
        canvasContext.moveTo(0, y);
        canvasContext.lineTo(width, y);
        canvasContext.stroke();
    }
}

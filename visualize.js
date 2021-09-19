export function line_chart(canvasId){
    var canvas = document.querySelector(canvasId);
    if (!canvas)
    {
        return;
        canvas=document.createElement("canvas");
        canvas.setAttribute("id", canvasId);
        document.body.append(canvas);
    }
    var canvasCtx = canvas.getContext("2d");
    canvas.setAttribute('width',canvas.parentElement.clientWidth);
    canvas.setAttribute('height',canvas.parentElement.clientHeight);
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height-15; // -15 for axis label;
    canvasCtx.clearRect(0,0,WIDTH,HEIGHT);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    var t = 0;

    function drawTimeseries(dataArray){

        var bufferLength = dataArray.length;

        canvasCtx.beginPath();
        var sliceWidth = 1;

        var ysum=0;
        var t0 = 0;

        for (var i = 0; i < bufferLength; i++) {

            var v = dataArray[i];
            var y = v * HEIGHT / 2;


            if(i - t0 < 2500){
                ysum += (y*y);
                continue;
            }
            y = Math.sqrt(ysum);
                t++;
                t0 = i;
                ysum=0;

            if (i === 0) {
                canvasCtx.moveTo(t,y);
            } else {
                canvasCtx.lineTo(t,y);
            }

            if( t >= WIDTH){
                t = 0;
                canvasCtx.clearRect(0,0,WIDTH,HEIGHT);

            }
            canvasCtx.clearRect(t, 0, 80,HEIGHT);
            t++;

        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }


    function drawFrame(dataArray){
        var bufferLength = dataArray.length;
        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0,20,WIDTH,HEIGHT);

        canvasCtx.beginPath();

        var x = 0;
        var sliceWidth = Math.floor(WIDTH/bufferLength)+1;
        for (var i = 0; i < bufferLength; i++) {

            var v = dataArray[i] / 280.0;
            var y = v * HEIGHT / 2;

            if (i === 0) {
                canvasCtx.moveTo(x,y);
            } else {
                canvasCtx.lineTo(x,y);
            }

            x += sliceWidth;
        }

    }

    function drawBars(dataArray,fftsize=255, samplerate=44180){
        var bufferLength = dataArray.length;
        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 15, WIDTH, HEIGHT);

        var barWidth = (WIDTH / fftsize);
        var barHeight;
        var x = 0;

        for(var i = 0; i < 80; i++) {
          barHeight = dataArray[i];

          canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';

          canvasCtx.fillRect(x,height-barHeight/2,barWidth,barHeight/2);

          x += barWidth + 1;
        }
        for(var i = 0; i < 80; i+=5) {
          barHeight = dataArray[i];

          canvasCtx.fillStyle = 'rgb(255,255,255)';
          canvasCtx.strokeStyle='rgb(255,0,0)';
          canvasCtx.textAlign ='center';
          var f = i/fftsize*samplerate;
          canvasCtx.strokeText(f+'hz', x, HEIGHT );

          x += barWidth + 1;
        }

    }
    return {
        canvas,canvasCtx,WIDTH,HEIGHT,
        drawFrame,drawBars,drawTimeseries
    }
}


export function time_series(canvasId){
    var canvas = document.querySelector(canvasId);
    var canvasCtx = canvas.getContext("2d");
    canvas.setAttribute('width',canvas.parentElement.clientWidth);
    canvas.setAttribute('height',canvas.parentElement.clientHeight);
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;
    canvasCtx.clearRect(0,0,WIDTH,HEIGHT);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';



}


function dbToY(db) {
    var y = (0.5 * this.height) - pixelsPerDb * db;
    return y;
}

export function drawCurve() {

        var curveColor = "rgb(192,192,192)";
    var playheadColor = "rgb(80, 100, 80)";
    var gridColor = "rgb(100,100,100)";


    // draw center
    width = canvas.width;
    height = canvas.height;
    var dbScale = 60;
    var pixelsPerDb;
    var width;
    var height;

    function dbToY(db) {
        var y = (0.5 * height) - pixelsPerDb * db;
        return y;
    }



    canvasContext.fillStyle = "rgb(0, 0, 0)";
    canvasContext.fillRect(0, 0, width, height);

    canvasContext.strokeStyle = curveColor;
    canvasContext.lineWidth = 3;

    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);

    pixelsPerDb = (0.5 * height) / dbScale;

    var noctaves = 11;

    var nyquist = 0.5 * context.sampleRate;

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
        canvasContext.strokeStyle = curveColor;
        canvasContext.strokeText(f.toFixed(0) + "Hz", x, 20);
    }

    // Draw 0dB line.
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0.5 * height);
    canvasContext.lineTo(width, 0.5 * height);
    canvasContext.stroke();

    // Draw decibel scale.

    for (var db = -dbScale; db < dbScale; db += 5) {
        var y = dbToY(db);
        canvasContext.strokeStyle = curveColor;
        canvasContext.strokeText(db.toFixed(0) + "dB", width - 40, y);

        canvasContext.strokeStyle = gridColor;
        canvasContext.beginPath();
        canvasContext.moveTo(0, y);
        canvasContext.lineTo(width, y);
        canvasContext.stroke();
    }
}

export function plot2(){


      // canvas stuff
      var canvas;
      var canvasContext;
      var canvasWidth = 0;
      var canvasHeight = 0;

      var curveColor = "rgb(192,192,192)";
      var playheadColor = "rgb(80, 100, 80)";
      var noteColor = "rgb(200,60,20)";
      var gridColor = "rgb(200,200,200)";

      var sampleRate = 44100.0;
      var nyquist = 0.5 * sampleRate;

      function dBFormatter(v, axis) {
        return v.toFixed(axis.tickDecimals) + " dB";
      }

      function degFormatter(v, axis) {
        return v.toFixed(axis.tickDecimals) + " deg";
      }

      function toms463 (xmin, xmax, n) {
        // From TOMS 463
        var sqr = [1.414214, 3.162278, 7.071068];
        var vint = [1, 2, 5, 10];
        var del = 0.00002
        // Arbitrarily use 4 intervals.
        var a = (xmax - xmin) / 4;
        var al = Math.log(a)/Math.LN10;
        var nal = Math.floor(al);
        if (a < 1) {
          nal = nal - 1;
        }
        var b = a / Math.pow(10, nal);
        var i = 4;
        for (i = 0; i < 3; ++i) {
          if (b < sqr[i]) {
            break;
          }
        }
        var dist = vint[i] * Math.pow(10, nal);
        var fm1 = xmin / dist;
        var m1 = Math.floor(fm1);
        if (fm1 < 0) {
          m1 = m1 - 1;
        }
        if (Math.abs(m1 + 1 - fm1) < del) {
          m1 = m1 + 1;
        }
        var xminp = dist * m1;
        var fm2 = xmax / dist;
        var m2 = Math.floor(fm2 + 1);
        if (fm2 < -1) {
          m2 = m2 - 1;
        }
        if (Math.abs(fm2 + 1 - m2) < del) {
          m2 = m2 - 1;
        }
        var xmaxp = dist * m2;
        if (xminp > xmin) {
          xminp = xmin;
        }
        if (xmaxp < xmax) {
          xmaxp = xmax;
        }
        return [xminp, xmaxp, dist];
      }
      function tickScale(axis) {
        // Compute scale
        var tickInfo = toms463(axis.min, axis.max, 4);

        // Generate ticks now.
        var ticks = [];
        var val = tickInfo[0];
        while (val <= tickInfo[1]) {
          ticks.push(val);
          val = val + tickInfo[2];
        }
        return ticks;
      }

      function drawCurve() {
        var width = 1000;

        var freq = new Float32Array(width);
        var magResponse = new Float32Array(width);
        var phaseResponse = new Float32Array(width);


        for (var k = 0; k < width; ++k) {
          var f = k / width;
          // Convert to log frequency scale (octaves).
	  f = Math.pow(2.0, noctaves * (f - 1.0));
          freq[k] = f * nyquist;
        }

        filter.getFrequencyResponse(freq, magResponse, phaseResponse);

        var magData = [];
        var phaseData = [];

        for (var k = 0; k < width; ++k) {
          db = 20.0 * Math.log(magResponse[k])/Math.LN10;
          phaseDeg = 180 / Math.PI * phaseResponse[k];
          magData.push([freq[k] , db]);
          phaseData.push([freq[k], phaseDeg]);
        }

        // Figure out the y axis range based on the filter type.

        var type = filter.type;

        switch (type) {
          case "lowpass":
            magmin = -80;
            magmax = 40;
            phasemin = -200;
            phasemax = 0;
            break;
          case "highpass":
            magmin = -80;
            magmax = 20;
            phasemin = 0;
            phasemax = 180;
            break;
          case "bandpass":
            magmin = -80;
            magmax = 0;
            phasemin = -180;
            phasemax = 180;
            break;
          case "lowshelf":
            {
              // Get the limits from the gain slider
              let slider = document.getElementById("gainSlider");
              magmin = slider.min;
              magmax = slider.max;
              phasemin = -180;
              phasemax = 180;
            }
            break;
          case "highshelf":
            {
              // Get the limits from the gain slider
              let slider = document.getElementById("gainSlider");
              magmin = slider.min;
              magmax = slider.max;
              phasemin = -180;
              phasemax = 180;
            }
            break;
          case "peaking":
            {
              // Get the limits from the gain slider
              let slider = document.getElementById("gainSlider");
              magmin = slider.min;
              magmax = slider.max;
              phasemin = -90;
              phasemax = 90;
            }
            break;
          case "notch":
            magmin = -60;
            magmax = 0;
            phasemin = -100;
            phasemax = 100;
            break;
          case "allpass":
            magmin = -1;
            magmax = 1;
            phasemin = -180;
            phasemax = 180;
            break;
          default:
            console.log(`Unknown filter type: ${type}`)
            break;
        }

        $.plot($("#graph"),
          [ { data : magData, label: "Mag (dB)" },
            { data : phaseData, label: "Phase (deg)", yaxis: 2 }],
          {
            //xaxes: [ { ticks : tickScale } ],
            yaxes: [ { tickFormatter: dBFormatter,
                       min: magmin,
                       max: magmax,
                       //ticks : tickScale
                     },
                     {
                       // align if we are to the right
                       alignTicksWithAxis: position = "right" ? 1 :
                       null,
                       position: position,
                       tickFormatter: degFormatter,
                       min: phasemin,
                       max: phasemax,
                       //ticks : tickScale
                      }],
            legend: { position: 'ne' }
          }
          );
      }
    }

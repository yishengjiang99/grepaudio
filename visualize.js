export function line_chart(canvasId){
    var canvas = document.querySelector(canvasId);
    var canvasCtx = canvas.getContext("2d");
    canvas.setAttribute('width',canvas.parentElement.clientWidth);
    canvas.setAttribute('height',canvas.parentElement.clientHeight);
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;
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
            canvasCtx.clearRect(t+100,0,t+80,HEIGHT);
            t++;

        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }


    function drawFrame(dataArray){
        var bufferLength = dataArray.length;
        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0,0,WIDTH,HEIGHT);

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

    function drawBars(dataArray){
        var bufferLength = dataArray.length;
     

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;

        for(var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];

          canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
          canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

          x += barWidth + 1;
        }
        
    }
    return {
        canvas,canvasCtx,WIDTH,HEIGHT,
        drawFrame,drawBars,drawTimeseries
    }  
}

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

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();

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
        drawFrame,drawBars
    }  
}
function drawFancyCurve(canvas, frequencyHz, dbResponses)
{
    canvas.setAttribute('width',canvas.parentElement.clientWidth);
    canvas.setAttribute('height',canvas.parentElement.clientHeight);

    canvasContext = canvas.getContext("2d");
    var curveColor = "rgb(192,192,192)";
    var gridColor = "rgb(100,100,100)";
    var textColor = 'rbg(255,255,255)';
    var bgcolor = 'rbg(0,0,0)';
    var width =  canvas.width;
    var height = canvas.height;
    var dbScale = 60;
    frequencyHz.sort();
    var pixelsPerDb = (0.5 * height) / dbScale;
    var maxFreq = frequencyHz[0];

    const dbToY= (db)=>(0.5 * height) - pixelsPerDb * db;
    const fToX = (f)=> (f-maxFreq) * width

    canvasContext.fillStyle = bgcolor;
    canvasContext.clearRect(0,0,width,height);
    canvasContext.fillRect(0,0,width,height);
    canvasContext.strokeStyle = curveColor;
    canvasContext.lineWidth = 3;
    canvasContext.beginPath();
    canvasContext.moveTo(0,0);

    for (var i = 0; i < frequencyHz.length; i++) {
        var f = frequencyHz[i];
        var dbResponse = dbResponses[i];
        var x = fToX(f);
        var y = dbToY(dbResponse);
        log(x + "," + y);
        if (i == 0)
            canvasContext.moveTo(x,y);
        else
            canvasContext.lineTo(x,y);
    }

    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.lineWidth = 1;
    canvasContext.strokeStyle = gridColor;

    // Draw frequency scale.
    for (var i = 0; i < frequencyHz.length; i++) {
        var f = frequencyHz[i];
        var x = fToX(x);
        canvasContext.strokeStyle = gridColor;
        canvasContext.moveTo(x,30);
        canvasContext.lineTo(x,height);
        canvasContext.stroke();
        canvasContext.textAlign = "center";
        canvasContext.strokeStyle = "white";
        canvasContext.strokeText(f.toFixed(0) + "Hz",x,20);
    }

    // Draw 0dB line.
    canvasContext.beginPath();
    canvasContext.moveTo(0,0.5 * height);
    canvasContext.lineTo(width,0.5 * height);
    canvasContext.stroke();

    // Draw decibel scale.

    for (var db = -dbScale; db < dbScale; db += 10) {
        var y = dbToY(db);
        canvasContext.strokeStyle = textColor;
        canvasContext.strokeText(db.toFixed(0) + "dB",width - 40,y);
        canvasContext.strokeStyle = gridColor;
        canvasContext.beginPath();
        canvasContext.moveTo(0,y);
        canvasContext.lineTo(width,y);
        canvasContext.stroke();
    }
}
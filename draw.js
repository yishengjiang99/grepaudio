export default function DrawEQ(ctx, filters) {

    var magResponse = new Float32Array(width);
    var phaseResponse = new Float32Array(width);
    var aggregate = new Float32Array(width).fill(0);

    var knobRadius = 5;
    var centerFreqKnobs = Array(filters.length).fill(null)
    var canvas = document.querySelector('#chart .layer1');

    var width = canvas.parentElement.clientWidth;
    var height = canvas.parentElement.clientHeight;

    canvas.setAttribute('width', canvas.parentElement.clientWidth);
    canvas.setAttribute('height', canvas.parentElement.clientHeight);

    var histogram = document.querySelector('#chart .layer2');
    histogram.setAttribute('width', canvas.parentElement.clientWidth);
    histogram.setAttribute('height', canvas.parentElement.clientHeight);
    var htx = histogram.getContext('2d');
    var vtx = canvas.getContext('2d');

    var filterIndexInFocus = -1;

    const noctaves = 11;
    const nyquist = ctx.sampleRate / 2;

    const freqs = calcNyquists(width);
    function xToFreq(x) {
        return freqs[x];
    }
    // const av = new AnalyzerView(c);
    // av.histogram('layer2', width, height);
    // var a = ctx.createAnalyser();
    // c.connect(a).connect(ctx.destination);

    var dbScale = 12;
    var pixelsPerDb = (0.5 * height) / dbScale;
    var curveColor = "rgb(192,192,192)";
    var playheadColor = "rgb(80, 100, 80)";
    var gridColor = "rgb(100,100,100)";
    // log(freqs);
    canvas.addEventListener('wheel', function (event) {
        event.preventDefault();

        if (event.deltaY < 0) {
            console.log('scrolling up');
            if (canvas_zoomscale < 3) canvas_zoomscale += 0.05;
            dirty = true;
            document.getElementById('status').textContent = 'scrolling up';
            drawScalesAndFrequencyResponses();

        }
        else if (event.deltaY > 0) {
            if (canvas_zoomscale > 0.5) canvas_zoomscale -= 0.05;
            dirty = true;
            drawScalesAndFrequencyResponses();
            console.log('scrolling down');
            document.getElementById('status').textContent = 'scrolling down';
        }
    });

    var shiftup = 0;
    function YToDb(y) {
        var db = (0.5 * height - (y - shiftup) / canvas_zoomscale) / pixelsPerDb;
        return db;
    }
    function dbToY(db) {
        var y = ((0.5 * height) - pixelsPerDb * db) * canvas_zoomscale + shiftup;
        return y;
    }

    var dirty = true;
    var canvas_zoomscale = 1;
    drawScalesAndFrequencyResponses();
const  status =(str)=>  document.getElementById('status').textContent=str;


    function drawScalesAndFrequencyResponses() {
        //centerFreqKnobs = Array(filters.length).fill(null);
        vtx.clearRect(0, 0, width, height);
        vtx.fillStyle = 'rgba(0,22,22)';
        vtx.fillRect(0, 0, width, height);
        // Draw frequency scale.
 
        // Draw 0dB line.
        vtx.beginPath();
        vtx.moveTo(0, 0.5 * height);
        vtx.lineTo(width, 0.5 * height);
        vtx.stroke();
        window.n_map ={};

        for (var octave = 0; octave <= noctaves; octave++) {
            var x = octave * width / noctaves;
            var f = ctx.sampleRate / 2 * Math.pow(2.0, octave - noctaves);
            window.n_map[f] = x;

            vtx.strokeStyle = gridColor;
            vtx.moveTo(x, 30);
            vtx.lineTo(x, height);
            vtx.stroke();
            vtx.textAlign = "center";
            vtx.strokeStyle = curveColor;
            vtx.strokeText(f.toFixed(0) + "Hz", x, 20);
        }
        const canvasContext = vtx;
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

        var cc = ['blue', 'red', 'green','yellow'];


        var magResponse = new Float32Array(width);
        var phaseResponse = new Float32Array(width);
        var aggregate = new Float32Array(width).fill(0);
        var knobRadius = 5;

        vtx.strokeStyle = 'white'
        vtx.strokeWidth = '1px';


        var centerFreqXMap = {};

        for (let i in filters) {
            const filter = filters[i]
            vtx.strokeWidth = 1;
            vtx.beginPath();
            vtx.moveTo(0, height/0);

            if (dirty == true) {
                filter.getFrequencyResponse(freqs, magResponse, phaseResponse);
                for (var k = 0; k < width; ++k) {
                    db = 20.0 * Math.log(magResponse[k]) / Math.LN10;
                    var phaseDeg = 180 / Math.PI * phaseResponse[k];
                    var realdb = db;//db * Math.cos(phaseDeg);
                    aggregate[k] += realdb;
                    let y = dbToY(realdb)
                    if (i == filterIndexInFocus) {
                        vtx.lineTo(k, dbToY(realdb));
                    }
                    if (k>0 && freqs[k] >= filter.frequency.value && freqs[k-1] <  filter.frequency.value) {
                        centerFreqKnobs[i] = [k, y];
                        centerFreqXMap[k] = i;
                    }
                }
            }
            vtx.strokeWidth =0;
      
            vtx.stroke();

            if (i == filterIndexInFocus) {
                vtx.lineTo(width, dbToY(0));
                vtx.lineTo(0, dbToY(0));
                vtx.closePath();
                vtx.fillStyle = `rgb(133,${i * 100},${i % 2 * 31},0.8)`;
                vtx.fill();
            }

        }

        for (let i = 0; i < centerFreqKnobs.length; i++) {
            if(i == filterIndexInFocus){
                vtx.fillStyle = 'blue';

            }else{
                vtx.fillStyle = 'green';

            }
            vtx.beginPath();
            vtx.arc(
                centerFreqKnobs[i][0] ,
                centerFreqKnobs[i][1] ,
                knobRadius, 0, Math.PI * 2, false);
            vtx.closePath();
            vtx.fill();
        }
        vtx.beginPath();

        vtx.strokeStyle='yellow'
        for (var k = 0; k < width; ++k) {
            var y = 20 * Math.log(aggregate[k]) / Math.LN10;
            vtx.lineTo(k, dbToY(aggregate[k]));
        }
        vtx.stroke();
        dirty = false;
        vtx.strokeText(_closest, 20,30)
        //requestAnimationFrame(drawScalesAndFrequencyResponses);
    }


    var filterIndexInFocus = -1;
    var lastClick;
    canvas.ondblclick = function (e) {
        log(" time sinze last click " + (ctx.currentTime - lastClick));
        if (filterIndexInFocus > -1) {
            let cval = filters[filterIndexInFocus].gain.value;
            filters[filterIndexInFocus].gain.setValueAtTime(YToDb(e.offsetY), ctx.currentTime);

            dirty = true;
            drawScalesAndFrequencyResponses();
        }
    }
    var mousedown = false;
    canvas.onmousedown = function (e) {
        console.log(e.shiftKey);
        mousedown = true;
    }
    canvas.onmouseup = function (e) {
        mousedown = false;
    }
    canvas.onmousemove = function (e) {
        if (mousedown === false){
            focusClosest(e);
        }
        if (mousedown === true && filterIndexInFocus > -1) {
            var targetQ;
            
            if (e.movementY * e.movementY > 1) {
                _closest=' movementY was '+e.movementY+" offset "+ e.offsetY ;
          
                if(e.shiftKey){
                    var modifier = e.movement > 0 ? 0.95 : 1.05;
                    filters[filterIndexInFocus].Q.setTargetAtTime(
                        filters[filterIndexInFocus].Q.value * modifier, 
                        ctx.currentTime + 0.001, 0.001);
                }else{
                    var targetGain = Math.log10(dbToY(e.offsetY));

                    filters[filterIndexInFocus].gain.setTargetAtTime(YToDb(e.offsetY),
                        ctx.currentTime + 0.001, 0.001);
                    
                }
            }
            if (e.movementX * e.movementX > 10) {

                filters[filterIndexInFocus].frequency.setTargetAtTime(xToFreq(e.offsetX), ctx.currentTime + 0.001, 0.001);
            }
            dirty = true;
            drawScalesAndFrequencyResponses();
        }
        //  e.offsetX;

    }


    canvas.ondragstart = function (e) {

        focusClosest(e);

    }
    var _closest = "";
    function focusClosest(e) {
        const mousex = e.offsetX;
        var lastFocus = filterIndexInFocus;
        var closest = width;
        lastClick = ctx.currentTime;
        for (let i in centerFreqKnobs) {
            if(centerFreqKnobs[i]===null) continue;
            if (Math.abs(centerFreqKnobs[i][0] - mousex) < closest) {
                filterIndexInFocus = i;
                closest = Math.abs(centerFreqKnobs[i][0] - mousex);
            }
        }

        if (closest < 20 && filterIndexInFocus !== lastFocus) {
            dirty = true;

            _closest = "closest changed at "+closest; 
            drawScalesAndFrequencyResponses();
        }else if(closest > 20 && filterIndexInFocus > -1){
            filterIndexInFocus = -1;
            drawScalesAndFrequencyResponses();

        }
    }


    function calcNyquists(width) {
        var freq = new Float32Array(width);
        var f_to_x = {};

        for (var k = 0; k < width; ++k) {
            var f = k / width;
            f = Math.pow(2.0, noctaves * (f - 1.0));
            freq[k] = Math.floor(f * nyquist);
        }
        window.allfreqs = freq;
        return freq;
    }


    function postFrameFromFFT(dataArray, analyzer){
        var barWidth = (width / analyzer.frequencyBinCount) 
        htx.clearRect(0,0,width,height);
        // bin_number_to_freq = (i) => nyquist * i /fftSize;
        var fftSize = analyzer.fftSize;
        
        var sum = 0;
        var x = 0;
        for(let i =0; i<fftSize; i++){
            let hue = i/analyzer.frequencyBinCount * 360 ;
            htx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
            var barHeight = (dataArray[i] - analyzer.minDecibels);
            htx.fillRect(x,height-barHeight,barWidth,barHeight);

            sum ++;
            x = x+barWidth;
        }
        htx.strokeText(dataArray[33], 44, 10, 100);
        document.getElementById("status").contentText=sum;
   


    }
    return {
        canvas,
        histogram,
        postFrameFromFFT,
        init_bin_to_pixel_map:function(){}
    }
}

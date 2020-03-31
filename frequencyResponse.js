
const getMicBtn = document.querySelector("#select-mike");
const audioElement = document.querySelector("audio#trackplayer");
const playButton = document.getElementById("playBtn");
const rx1 = document.getElementById("rx1");


const DEFAULT_BIQUAD_GAIN_FACTORS = [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5];

//https://sound.stackexchange.com/a/38389
const SIXTEEN_BAND_FREQUENCY_RANGE = [20,50,100,156,220,311,440,622,880,1250,1750,2500,3500,5000,10000,20000];

var num_nodex = DEFAULT_BIQUAD_GAIN_FACTORS.length;

const audioCtx = new AudioContext();

/*
    states
 */
var audioSource;
var audioInput = "trackplayer";


//gain node
var gainNode = audioCtx.createGain();
const volumeControl = document.querySelector('[data-action="volume"]');
volumeControl && volumeControl.addEventListener('input',function ()
{
    log(" volumn changed to " + this.value);
    gainNode.gain.value = this.value;
},false);

const beqContainer = document.getElementById("beq_container");
const beqSliderTemplate = document.getElementById("beq_template");
var biquadFilters = SIXTEEN_BAND_FREQUENCY_RANGE.map((freq,index) =>
{
    var filter = audioCtx.createBiquadFilter();
    var gain = DEFAULT_BIQUAD_GAIN_FACTORS[index];
    filter.type = index === 0 ? "lowshelf" : (index === num_nodex - 1 ? "highshelf" : "peaking");
    filter.frequency.setValueAtTime(freq,audioCtx.currentTime);
    filter.gain.setValueAtTime(gain,audioCtx.currentTime);
    return filter;
});
biquadFilters.forEach((filter,index) =>
{
    var control = beqSliderTemplate.cloneNode(true);
    var label = document.createElement("label");

    var freq = SIXTEEN_BAND_FREQUENCY_RANGE[index];

    label.innerHTML = freq + " Hz";

    control.value = DEFAULT_BIQUAD_GAIN_FACTORS[index];
    control.min = 0;
    control.max = 20;
    control.index = index;

    var li = document.createElement("li");
    li.appendChild(control);
    li.appendChild(label);

    beqContainer.appendChild(li);

    control.addEventListener("input",(e) =>
    {
        gain = parseFloat(e.target.value);
        index = parseInt(e.target.index);
        filter.gain.setValueAtTime(gain,audioCtx.currentTime);

        log('setting beq ' + index + " to " + gain);
    });
});


var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85
var inputAnalyzer = audioCtx.createAnalyser();
inputAnalyzer.minDecibels = -90;
inputAnalyzer.maxDecibels = -10;
inputAnalyzer.smoothingTime;


var audioInput = "trackplayer";
getMicBtn.addEventListener("click",function (e)
{
    audioInput = "usermedia";
    if (this.dataset.playing == "false") {
        this.dataset.playing = "true";
        init();

    } else {
        stream.getTracks().forEach(function (track)
        {
            track.stop();
        });
        this.dataset.playing = "false";
        disconnectSourceAndAnimation();
    }
})

playButton.addEventListener("click",function (e)
{
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (this.dataset.playing === 'false') {
        this.dataset.playing = 'true';
        audioElement.play();
        init();
        // if track is playing pause it
    } else if (this.dataset.playing === 'true') {
        audioElement.pause();
        this.dataset.playing = 'false';
        cancelAnimationFrame(animeTimer)
    }

    let state = this.getAttribute('aria-checked') === "true" ? true : false;
    this.setAttribute('aria-checked',state ? "false" : "true");
    log(audioCtx.state + " audio state")
});

async function init()
{
    if (audioSource) audioSource.disconnect();

    if (audioInput == "trackplayer") {
        audioSource = audioCtx.createMediaElementSource(audioElement);

    } else if (audioInput == 'usermedia') {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioSource = audioCtx.createMediaStreamSource(stream);
    }

    if (!audioSource) {
        throw new Error("track not found");
        return;
    }
    link_audio_graph();
    visualize('#input_time', inputAnalyzer, "time");
    visualize('#input_freq', inputAnalyzer, "frequency");
    visualize('#output_time', inputAnalyzer, "time");
    visualize('#freq', inputAnalyzer,  "frequency");

}

function link_audio_graph()
{
    if (!audioSource) throw new Error("no audio source");

    var c = audioSource;
    [inputAnalyzer,gainNode].concat(biquadFilters).concat([analyser,audioCtx.destination]).forEach(node =>
    {
        c.connect(node);
        c = node;
    })
}

var animationTimers = [];
function visualize(canvasId,analyser,domain = 'time')
{
    var canvas = document.querySelector(canvasId);
    var canvasCtx = canvas.getContext("2d");
    canvas.setAttribute('width',canvas.parentElement.clientWidth);
    canvas.setAttribute('height',canvas.parentElement.clientHeight);
    WIDTH = canvas.width * 0.9;
    HEIGHT = canvas.height * 0.9;
    canvasCtx.clearRect(0,0,WIDTH,HEIGHT);
    input_time

    if (domain == 'time') {
        analyser.fftSize = 2048;
        var bufferLength = analyser.fftSize;
        var dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        drawTimeDomain(canvasCtx,dataArray);

    } else {
        analyser.fftSize = 256;
        var bufferLength = analyser.frequencyBinCount;
        console.log(bufferLength);
        var dataArray = new Uint8Array(bufferLength);
        drawFrequency(canvasCtx,dataArray);
    }

}






function drawFrequencyDomain(canvasCtx,dataArray)
{
    drawVisual = requestAnimationFrame(drawFrequencyDomain);


    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0,0,WIDTH,HEIGHT);


    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        canvasCtx.fillRect(x,HEIGHT - barHeight / 2,barWidth,barHeight / 2);

        x += barWidth + 1;
    }
    dataArray = new Uint8Array();
    analyser.drawFrequencyDomain(dataArray);
    drawFrequencyDomain(canvasCtx,dataArray);

}

var drawTimeDomain = function (canvasCtx,dataArray)
{
   
    freq1 = requestAnimationFrame(drawTimeDomain);


    if (Math.random(0,1) > 0.1) return;
    dataArray = new Uint8Array();
    analyser.getByteTimeDomainData(dataArray)
    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    debugger;
    canvasCtx.fillRect(0,0,WIDTH,HEIGHT);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
    canvasCtx.beginPath();
    var sliceWidth = WIDTH / bufferLength;
    var x = 0;
    var sum = 0;
    for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i];
        var y = (v / 255) * HEIGHT * 0.7;
        if (i === 0) {
            canvasCtx.moveTo(x,y);
        } else {
            canvasCtx.lineTo(x,y);
        }
        x += sliceWidth;
        sum += v;
    }


    canvasCtx.lineTo(canvas.width,canvas.height / 2);
    canvasCtx.stroke();
    // rx1.innerHTML=Math.min.apply(Math, dataArray)  +"-"+Math.max.apply(Math, dataArray);
    drawTimeDomain(canvasCtx,dataArray);
}

function disconnectSourceAndAnimation()
{
    audioCtx.pause();
    cancelAnimationFrame(animeTimer);
}

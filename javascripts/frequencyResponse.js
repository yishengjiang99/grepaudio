
const getMicBtn = document.querySelector("#select-mike");
const audioElement = document.querySelector("audio#trackplayer");
const playButton = document.getElementById("playBtn");
const audioCtx = new AudioContext();
var analyzer;

var distortion = audioCtx.createWaveShaper();
var gainNode = audioCtx.createGain();

const rx1 = document.getElementById("rx1")

var audioInput = "trackplayer";
getMicBtn.addEventListener("click",function (e)
{
    audioInput = "usermedia";
    if (this.dataset.playing == "false") {
        this.dataset.playing = "true";

        init();
        log("mic on")

    } else {
        stream.getTracks().forEach(function (track)
        {
            track.stop();
        });
        this.dataset.playing = "false";
        log("mic off")
    }
})
const volumeControl = document.querySelector('[data-action="volume"]');
volumeControl.addEventListener('input',function ()
{
    log(" volumn changed to " + this.value);
    gainNode.gain.value = this.value;
},false);

playButton.addEventListener("click",onPlayClicked);

async function init()
{
    if (audioInput == "trackplayer") {
        track = audioCtx.createMediaElementSource(audioElement);

    } else if (audioInput == 'usermedia') {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        track = audioCtx.createMediaStreamSource(stream);
    }

    if (!track) {
        throw new Error("track not found");
        return;
    }
    track.connect(gainNode);
    

    analyser = audioCtx.createAnalyser();
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    gainNode.connect(analyser);


    analyser.connect(audioCtx.destination);
    visualize();
}


var animeTimer;
function visualize(){

    var canvas = document.querySelector("canvas");
    var canvasCtx = canvas.getContext("2d");
    canvas.setAttribute('width', document.querySelector("#canvas_wrapper").clientWidth);

    WIDTH = canvas.width;
    HEIGHT = canvas.height;  
    analyser.fftSize = 2048;
    var bufferLength = analyser.fftSize;
    var dataArray = new Uint8Array(bufferLength);
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    var draw = function(){
        animeTimer = requestAnimationFrame(draw);

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        analyser.getByteTimeDomainData(dataArray);
  

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;
        var sum=0;
        for(var i = 0; i < bufferLength; i++) {

          var v = dataArray[i] / 32.0;
          var y = v * HEIGHT/2;
          if(i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
          sum+=v;
        }

        canvasCtx.lineTo(canvas.width, canvas.height/2);
        canvasCtx.stroke();
        rx1.innerHTML=sum+"";

    }

    draw();




}
const DEFAULT_BIQUAD_FILTER_GAINS = [2,9,11,17,18,18,17,15,12,10,9,8,7,6,5,5];
const NODES_NUM = 16;
function getBandBiquadFiltersForAudioContext(audioCtx,gains)
{
    //https://subscription.packtpub.com/book/web_development/9781782168799/1/ch01lvl1sec12/building-an-equalizer-using-biquadfilternode-advanced
    var tempFilter = audioCtx.createBiquadFilter();
    var freqMin = tempFilter.frequency.minValue
        + EQ_FREQ_MARGIN;
    var freqMax = tempFilter.frequency.maxValue
        - EQ_FREQ_MARGIN;
    var freqStep = (freqMax - freqMin) / (NODES_NUM - 1);

    var filters = [];
    for (let i in gains) {
        let filter = audioCtx.createBiquadFilter();
    }
}
function onPlayClicked(e)
{

    log(audioCtx.state + " audio state")

    // check if context is in suspended state (autoplay policy)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (this.dataset.playing === 'false') {
        audioElement.play();
        this.dataset.playing = 'true';
        visualize();

        // if track is playing pause it
    } else if (this.dataset.playing === 'true') {
        audioElement.pause();
        this.dataset.playing = 'false';
        cancelAnimationFrame(animeTimer)
    }

    let state = this.getAttribute('aria-checked') === "true" ? true : false;
    this.setAttribute('aria-checked',state ? "false" : "true");

}


init();

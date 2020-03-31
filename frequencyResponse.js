
const getMicBtn = document.querySelector("#select-mike");
const audioElement = document.querySelector("audio#trackplayer");
const playButton = document.getElementById("playBtn");
const rx1 = document.getElementById("rx1");


const DEFAULT_BIQUAD_GAIN_FACTORS = [
    6, 27, 33, 51,
     54, 54, 51, 45,
      36, 30, 27, 24, 
      21, 18, 15, 15,
      20, 20, 20, 20,20
 ]

//https://sound.stackexchange.com/a/38389
const SIXTEEN_BAND_FREQUENCY_RANGE=[
    19.999, 25.170, 31.687, 39.893, 
    50.224, 63.229, 79.603, 100.22, 
    126.17, 158.84, 1.9997, 251.76, 
    316.95, 399.03, 502.36, 632.46, 
    796.23, 1002.4, 1262.0, 1588.8, 2000.3
];


const audioCtx = new AudioContext();

var gainNode = audioCtx.createGain();
const volumeControl = document.querySelector('[data-action="volume"]');
volumeControl && volumeControl.addEventListener('input',function ()
{
    log(" volumn changed to " + this.value);
    gainNode.gain.value = this.value;
},false);



var cursor = gainNode;
const beqContainer = document.getElementById("beq_container");

var biquadFilters = SIXTEEN_BAND_FREQUENCY_RANGE.forEach( (freq,index) =>{
    var filter = audioCtx.createBiquadFilter();
    var gain = DEFAULT_BIQUAD_GAIN_FACTORS [ index];
    gain = 1;

    filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
    filter.gain.setValueAtTime(gain, audioCtx.currentTime);

    filter.type = index === 0  ? "lowshelf" : (index === 15 ? "highshelf" : "peaking");
    log("set gain to "+gain);
    var control = document.createElement("input");
    var label = document.createElement("label");
   
    label.innerHTML=freq+" Hz";
    var attrs = {type:'range', min:0, max:60, value:gain, step:0.1, index:index};

    for(let k in attrs) control.setAttribute(k, attrs[k]);

    control.addEventListener("input", (e) => {
        gain = e.target.value;
        e.target.attrs['index'];
        log('setting beq '+index+" to "+gain);
        filter.gain.value= filter.gain.setValueAtTime(gain, audioCtx.currentTime);
    });

    var li = document.createElement("li");
    li.appendChild(control);
    li.appendChild(label);

    beqContainer.appendChild(li);

    cursor.connect(filter);
    cursor = filter;
});



var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;
cursor.connect(analyser);
analyser.connect(audioCtx.destination);

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

          var v = dataArray[i] / 128.0;
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

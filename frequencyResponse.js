
const getMicBtn = document.querySelector("#select-mike");
const audioElement = document.querySelector("audio#trackplayer");
const playButton = document.getElementById("playBtn");
const rx1 = document.getElementById("rx1");


const DEFAULT_BIQUAD_GAIN_FACTORS = [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5];

//https://sound.stackexchange.com/a/38389
const SIXTEEN_BAND_FREQUENCY_RANGE = [20,50,100,156,220,311,440,622,880,1250,1750,2500,3500,5000,10000,20000];

var num_nodex = DEFAULT_BIQUAD_GAIN_FACTORS.length;

const audioCtx = new AudioContext();

var audioTagSource,audioMicSource;
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


//biquad filters 
var freq_bands = SIXTEEN_BAND_FREQUENCY_RANGE;
var gains = DEFAULT_BIQUAD_GAIN_FACTORS;
const beqContainer = document.getElementById("beq_container");
var biquadFilters = biquad_filter_list(freq_bands,gains,beqContainer);
var outputAnalyzer = audioCtx.createAnalyser();
outputAnalyzer.minDecibels = -90;
outputAnalyzer.maxDecibels = -10;
outputAnalyzer.smoothingTimeConstant = 0.85

var inputAnalyzer = audioCtx.createAnalyser();
inputAnalyzer.minDecibels = -90;
inputAnalyzer.maxDecibels = -10;
inputAnalyzer.smoothingTimeConstant = 0.85;
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
        this.innerText = "pause"

        // if track is playing pause it
    } else if (this.dataset.playing === 'true') {
        audioElement.pause();
        this.dataset.playing = 'false';
        disconnectSourceAndAnimation();
        this.innerText = "play"
    }

    let state = this.getAttribute('aria-checked') === "true" ? true : false;
    this.setAttribute('aria-checked',state ? "false" : "true");
    log(audioCtx.state + " audio state")
});

async function init()
{
    if (audioInput == "trackplayer") {

        audioTagSource = audioTagSource || audioCtx.createMediaElementSource(audioElement);
        audioSource = audioTagSource;
    } else if (audioInput == 'usermedia') {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioSource = audioCtx.createMediaStreamSource(stream);
    }

    if (!audioSource) {
        throw new Error("track not found");
        return;
    }
    link_audio_graph();
    stopped = false;
    animationTimers = [
        visualize('#input_time',inputAnalyzer,"time"),
        visualize('#input_freq',inputAnalyzer,"frequency"),
        visualize('#output_time',outputAnalyzer,"time"),
        visualize('#output_freq',outputAnalyzer,"frequency")
    ];

}

function link_audio_graph()
{
    if (!audioSource) throw new Error("no audio source");

    var c = audioSource;
    [inputAnalyzer,gainNode].concat(biquadFilters).concat([outputAnalyzer,audioCtx.destination]).forEach(node =>
    {
        c.connect(node);
        c = node;
    })
}

var animationTimers = [];

var stopped = false;

function disconnectSourceAndAnimation()
{
    audioSource.disconnect();
    outputAnalyzer.disconnect();

    animationTimers.forEach(t => cancelAnimationFrame(t));
    stopped = true;
}


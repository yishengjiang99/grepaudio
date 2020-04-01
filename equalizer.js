
const getMicBtn = document.querySelector("#select-mike");
const audioElement = document.querySelector("audio#trackplayer");
const playButton = document.getElementById("playBtn");
const rx1 = document.getElementById("rx1");

var num_nodex =12;

const audioCtx = new AudioContext();

var audioTagSource,audioMicSource;
var placeholder = audioCtx.createOscillator();
var audioSource = placeholder;
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
var freq_bands = nyquist_hzs(audioCtx.sampleRate,num_nodex);
var gains = Array(16).fill(0);
var bandwidths = Array(16).fill(8);

const beqContainer = document.getElementById("beq_container");
var biquadFilters = biquad_filter_list(freq_bands,gains,bandwidths, beqContainer);
var outputAnalyzer = audioCtx.createAnalyser();
outputAnalyzer.minDecibels = -90;
outputAnalyzer.maxDecibels = -10;
outputAnalyzer.smoothingTimeConstant = 0.85

var inputAnalyzer = audioCtx.createAnalyser();
inputAnalyzer.minDecibels = -90;
inputAnalyzer.maxDecibels = -10;
inputAnalyzer.smoothingTimeConstant = 0.85;

link_audio_graph();
update_eq_ui();

async function start()
{
    if(audioSource) audioSource.disconnect();
    if (audioInput == "trackplayer") {

        audioTagSource = audioTagSource || audioCtx.createMediaElementSource(audioElement);
        audioSource = audioTagSource;
    } else if (audioInput == 'usermedia') {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioMicSource = audioCtx.createMediaStreamSource(stream);
       
        audioSource = audioMicSource;
    }


    if (!audioSource) {
        throw new Error("track not found");
        return;
    }

    audioSource.connect(inputAnalyzer);
    update_eq_ui();
    stopped = false;
    animationTimers = [
        visualize('#input_time',inputAnalyzer,"time"),
        visualize('#input_freq',inputAnalyzer,"frequency"),
        visualize('#output_time',outputAnalyzer,"time"),
        visualize('#output_freq',outputAnalyzer,"frequency")
    ];

}

function update_eq_ui(){
    var freqs= nyquist_hzs(audioCtx.sampleRate,num_nodex);
    var aggregated_amps = aggregate_frequency_response(biquadFilters,freqs);
    var eq_ui =  document.getElementById("eq_ui");
    eq_ui.innerHTML = `freq response at nyquist sample rates
    <table>
    ${aggregated_amps.map( (amp,i)=>{
        var meter = "<meter min='0' max='60' value='"+amp+"'></meter>"
        return "<tr><td>"+Math.round(freqs[i],2)+" Hz </td><td> "+meter+"</td><td> "+amp+"</td></tr>"
    }).join("")}
    </table>`
}


function link_audio_graph()
{    
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


function nyquist_hzs(sampleRate,noctaves){
    var nyquist = 0.5 * sampleRate;
    frequencyHz= new Float32Array(noctaves);
    for (var i = 0; i < noctaves; ++i) {
        var f = i / noctaves;
        f = nyquist * Math.pow(2.0, noctaves * (f - 1.0));
        frequencyHz[i] = f;
    }
    return frequencyHz;

}

//ui buttons

var audioInput = "trackplayer";

getMicBtn.addEventListener("click",function (e)
{
    alert("broken");
    return;
    audioInput = "usermedia";
    if (this.dataset.playing == "false") {
        this.dataset.playing = "true";
        start();
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
        start();
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
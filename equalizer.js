import BiquadFilters from './biquadFilters.js'

import io_samplers from './io_samplers.js'
import bufferReader from "./lib/bufferReader.js";
import DynamicCompressionModule from './compression.js';

import './polyfills.js'

const getMicBtn = document.querySelector("#select-mike");
const audioTag = document.querySelector("audio");
const playButton = document.getElementById("playBtn");


const rx1 = document.getElementById("rx1");
const logrx1 = (txt) => rx1.innerHTML=txt;
var num_nodex =12;
const audioCtx = new AudioContext();

var sinewave = audioCtx.createOscillator();
var mediaTagSource  = audioCtx.createMediaElementSource(audioTag);

var userStream;
var micSource;
var audioSource = sinewave;

//gain node
var gainNode = audioCtx.createGain();
const volumeControl = document.querySelector('[data-action="volume"]');
volumeControl && volumeControl.addEventListener('input',function ()
{
    log(" volumn changed to " + this.value);
    gainNode.gain.value = this.value;
},false);

var compressors = DynamicCompressionModule(audioCtx);
compressors.addDefault();

var compressorDiv = document.getElementById("compressor_container");
compressors.attach_form(compressorDiv);


//biquad filters 
var freq_bands = nyquist_hzs(audioCtx.sampleRate,num_nodex);
var gains = Array(16).fill(0);
var bandwidths = Array(16).fill(8);

const beqContainer = document.getElementById("beq_container");
var biquadFilters = BiquadFilters.get_list(audioCtx, freq_bands,gains,bandwidths);
BiquadFilters.link_ui(beqContainer);

var analyzerNodeList = io_samplers(audioCtx, 2048);

audioCtx.onstatechange= function(ev){
    switch(ev.target.state){
        case "running": analyzerNodeList.sample_time_domain(audioCtx); break;
        default: logrx1('ctx state'+ev.target.state);break;
    }
}


link_audio_graph();
update_eq_ui();

const inputSelect = document.getElementById("inputselect")

var isPlaying = false;
playButton.addEventListener("click", async function (e)
{
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if(isPlaying==true){
        this.innerText="start";
   
        if(sinewave.state=='running') sinewave.stop();
        if(micDiv.isPlaying) micDiv.pause();

        isPlaying=false;
        return;
     
    }

    var start_ =null;
    switch(inputSelect.value){
        case "sine": 
            sinewave =  audioCtx.createOscillator(); 
            audioSource = sinewave;
            start_ = () => audioSource.start();
            break;
        case "song": 

            audioSource = mediaTagSource;
             start_ = () => audioTag.play();
            break;

        case 'mic':
            audioSource = await getAudioDevice(audioCtx);
            start_ = () => micdiv.play();
            break;
         default: 
            audioSource=sinewave;
            break;
    }
    isPlaying=true;
    this.innerText="pause";

    link_audio_graph();
    update_eq_ui();
    start_();
});

window.onload = function(e){
    var list = document.getElementsByClassName('update_gain');
    for(const l of list){
        l.addEventListener("change",(event)=>{
            var index = parseInt( event.target.dataset.index );
            document.getElementById(`gain_val_${index}`).innerHTML = event.target.value;
            biquadFilters[index].gain.setValueAtTime(event.target.value, audioCtx.currentTime);
            update_eq_ui();
        })
    }

    list = document.getElementsByClassName('update_q');
    for(const l of list){
        l.addEventListener("change",(event)=>{
            var index = parseInt( event.target.dataset.index );
            document.getElementById(`qval_${index}`).innerHTML = event.target.value;
            biquadFilters[index].Q.setValueAtTime(event.target.value, audioCtx.currentTime);
            update_eq_ui();
        })
    }
}


async function getAudioDevice(ctx) {
  if (!navigator.mediaDevices) {
    throw new Error("web rtc not available")
  }
  try{
    var stream = await navigator.mediaDevices.getUserMedia({audio:true});

   var micdiv = document.getElementById("microphone")
    micdiv.srcObject = stream;
    micdiv.onloadedmetadata = function(e) {
        micdiv.muted = true;
    };
    micSource =audioCtx.createMediaStreamSource(stream);
    return micSource;
  }catch(e){
    throw e;
  }
}

function link_audio_graph()
{    
    audioSource.connect(analyzerNodeList.inputAnalyzer);
    analyzerNodeList.inputAnalyzer.connect(gainNode);
    var cursor = gainNode;
    biquadFilters.forEach(filter=>{
        cursor.connect(filter);
        cursor=filter;
    })
    cursor.connect(analyzerNodeList.outputAnalyzer);
    analyzerNodeList.outputAnalyzer.connect(audioCtx.destination);
}


function update_eq_ui(){
    var freqs= nyquist_hzs(audioCtx.sampleRate,num_nodex);
    var aggregated_amps = BiquadFilters.aggregate_frequency_response(biquadFilters,freqs);
    aggregated_amps.forEach( (amp,index)=>{
        document.getElementById(`freq_resp_meter_${index}`).value = amp;
    });
}


function disconnectSourceAndAnimation()
{

    analyzerNodeList.disconnect();
    var stopped = true;
}


function nyquist_hzs(sampleRate,noctaves){
    var nyquist = 0.5 * sampleRate;
    var frequencyHz= new Float32Array(noctaves);
    for (var i = 0; i < noctaves; ++i) {
        var f = i / noctaves;
        f = nyquist * Math.pow(2.0, noctaves * (f - 1.0));
        frequencyHz[i] = f;
    }
    return frequencyHz;
}

//ui buttons


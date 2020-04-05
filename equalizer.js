import BiquadFilters from './biquadFilters.js'

import io_samplers from './io_samplers.js'
import bufferReader from "./lib/bufferReader.js";
import DynamicCompressionModule from './compression.js';
import PlayableAudioSource from './audio_source.js';
import './polyfills.js'
const NYQUIST_SAMPLE_RATE_x2 = 441000;
const NUM_FREQUENCY_BANDS = 12;



let audioCtx, pre_amp, post_amp;
var biquadFilters, compressors; //list of 16
let analyzerNodeList, mod_compressor;

let audioTagSource, micTagSource, white_noise, sinewave;


let activeInputSource;
let userMediaStreamSource;


let volumeSamplers = [];
let letancySamplers = [];



const startBtn = document.getElementById("start");
const getMicBtn = document.querySelector("#select-mike");
const audioTag = document.querySelector("audio#trackplayer");
const playButton = document.getElementById("playBtn");
const rx1 = document.getElementById("rx1");
const volumeControl = document.getElementById("volume");
const volumeControl2 =document.getElementById("volume2");
const compressorDiv = document.getElementById("compressor_container");
const inputSelect = document.getElementById("inputselect")
const list = document.getElementsByClassName('update_gain');
const eq_ui_container = document.getElementById('eq_ui_container');
const eq_update_form =document.getElementById('eq_update_form');
const eq_ui_row_template = document.getElementById("eq_ui_row_template");
const logrx1 = (txt) => rx1.innerHTML=txt;  


startBtn.onclick=initializeContext;

volumeControl.addEventListener('input', ()=>pre_amp.gain.value = event.target.value);
volumeControl2.addEventListener('input', ()=>post_amp.gain.value = event.target.value);
getMicBtn.onclick = () => getAudioDevice().then(source => set_audio_input(source));

function start(){
    audioCtx = null;
    initializeContext();
    if(audioTag.canplay){
        audioTag.play();
    }
}

let hz_bands;
function initializeContext(){
    if(!audioCtx) {
        audioCtx = new AudioContext();
    }

    audioCtx.onstatechange= function(ev){
        switch(ev.target.state){
            case "running": analyzerNodeList.run_samples(audioCtx); break;
            default: logrx1('ctx state'+ev.target.state);break;
        }
        return false;
    }
       hz_bands = nyquist_hzs(audioCtx.sampleRate, NUM_FREQUENCY_BANDS);

     sinewave = audioCtx.createOscillator();
     pre_amp = audioCtx.createGain();
     post_amp = audioCtx.createGain();

     mod_compressor = DynamicCompressionModule(audioCtx);
        mod_compressor.addDefaults(NUM_FREQUENCY_BANDS);
        compressors = mod_compressor.list;

    var gains = Array(16).fill(0);
    var bandwidths = Array(16).fill(8);
    biquadFilters = BiquadFilters.get_list(audioCtx, hz_bands ,gains,bandwidths);


    analyzerNodeList = io_samplers(audioCtx, 2048);




    activeInputSource=audioTagSource;

    audioTagSource = audioCtx.createMediaElementSource(audioTag);
    audioTagSource.connect(analyzerNodeList.inputAnalyzer);


    //activeInputSource.connect(analyzerNodeList.inputAnalyzer);


    analyzerNodeList.inputAnalyzer.connect(pre_amp);
    var c = pre_amp;
    for(let i =0; i<biquadFilters.length; i++){
        c.connect(biquadFilters[i]);
        c = biquadFilters[i];
    }

    for(let i =0; i<compressors.length; i++){
        c.connect(compressors[i]);
        c = compressors[i];

    }
    c.connect(post_amp);
    post_amp.connect(analyzerNodeList.outputAnalyzer);
    analyzerNodeList.outputAnalyzer.connect(audioCtx.destination);

    init_eq_controls();
}
function init_eq_controls(){
 
    audioTag.addEventListener("canplay", console.log);
    audioTag.addEventListener("canplay|loadedmetadata|play|ended", console.log);
    hz_bands.forEach( (hz, i)=>{
        var row = eq_ui_row_template.content.cloneNode(true);
        row.querySelector(".hz_label").innerHTML = hz;
        row.querySelectorAll("input").forEach( (input, index)=> {
            input.addEventListener('input', e=> {
                onEQConfigUpdate(index, e);
            })
        })
        eq_ui_container.append(row);
    });
}

function onEQConfigUpdate(i, e){
    if(audioCtx === null ) initializeContext();   
    var value = e.target.value;
    switch(e.target.name){
        case "gain":  
            biquadFilters[i].gain.setValueAtTime(value, audioCtx.currentTime+1); break;
        case "q":    
             biquadFilters[i].Q.setValueAtTime(value, audioCtx.currentTime+1); break;
        case "threshold":
        case "ratio":
        case "knee":
        case "attack":
        case "release": 
            mod_compressor.getAttributeValue(compressors[i], e.target.name).setValueAtTime(value, audioCtx.currentTime+1);
            break;
        default: /*wtf*/ break;
    }

    if(e.target.type=='range'){
        e.target.parentElement.parentElement.getElementsByClassName(e.target.name+"_label")[0].innerHTML = e.target.value;
    }
    var frps= BiquadFilters.aggregate_frequency_response(biquadFilters, hz_bands);


    frps.forEach( (amp,index)=>{ 
        document.getElementsByClassName("freq_resp_meter")[index].value = amp;
    });
}

function nyquist_hzs(sampleRate,noctaves){
    var nyquist = 0.5 * sampleRate;
    var frequencyHz= new Float32Array(noctaves);
    for (var i = 0; i < noctaves; ++i) {
        var f = i / noctaves;
        f = nyquist * Math.pow(2.0, noctaves * (f - 1.0));
        frequencyHz[i] = f;
    }
    return frequencyHz
}



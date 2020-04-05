import BiquadFilters from './biquadFilters.js'

import io_samplers from './io_samplers.js'
import bufferReader from "./lib/bufferReader.js";
import DynamicCompressionModule from './compression.js';
import PlayableAudioSource from './audio_source.js';
import './polyfills.js'
const NYQUIST_SAMPLE_RATE_x2 = 441000;
const NUM_FREQUENCY_BANDS = 14;



let audioCtx, pre_amp, post_amp;
var biquadFilters, compressors; //list of 16
let analyzerNodeList, mod_compressor;

let audioTagSource, micTagSource, white_noise, sinewave;
let inputAnalyzer, outputAnalyzer, audioTag;

let activeInputSource;
let userMediaStreamSource;


let volumeSamplers = [];
let letancySamplers = [];



const startBtn = document.getElementById("start");
const getMicBtn = document.querySelector("#select-mike")
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
window.logrx1 = (txt) => rx1.innerHTML=txt;  


startBtn.onclick=initializeContext;

volumeControl.addEventListener('input', ()=> pre_amp.gain.value = event.target.value);
volumeControl2.addEventListener('input', ()=> post_amp.gain.value = event.target.value);
getMicBtn.onclick = () => {

    PlayableAudioSource(audioCtx).getAudioDevice(audioCtx).then(source => source.connect(analyzerNodeList.inputAnalyzer));
}

function start(){
    audioCtx = null;
    initializeContext();
        debug();

    if(audioTag.canplay){
        audioTag.play();
    }
}

let hz_bands;
let currentDspCursor;

function insert_dsp_filter(filter){
    if(!currentDspCursor) pre_amp.connect(filter);
    else{
        currentDSPCursor.disconnect();
        currentDSPCursor.connect(filter);
    }
    filter.connect(post_amp)
}
function initializeContext(){
    if(!audioCtx) {
        audioCtx = new AudioContext();
    }else{
        return;
    }

    audioCtx.onstatechange= function(ev){
        switch(ev.target.state){
            case "running": analyzerNodeList.run_samples(audioCtx); break;
            default: logrx1('ctx state'+ev.target.state);break;
        }
        return false;
    }
    hz_bands = nyquist_hzs(audioCtx.sampleRate*2, NUM_FREQUENCY_BANDS);

     sinewave = audioCtx.createOscillator();
     pre_amp = audioCtx.createGain();
     post_amp = audioCtx.createGain();

     mod_compressor = DynamicCompressionModule(audioCtx);
        mod_compressor.addDefaults(NUM_FREQUENCY_BANDS);
        compressors = mod_compressor.list;

    var gains = Array(16).fill(0);
    var bandwidths = Array(16).fill(8);
    
    // biquadFilters = BiquadFilters.get_list(audioCtx, hz_bands ,gains,bandwidths);

    biquadFilters=[];   
    analyzerNodeList = io_samplers(audioCtx, 2048);

    inputAnalyzer=analyzerNodeList.inputAnalyzer;
    outputAnalyzer = analyzerNodeList.outputAnalyzer;
    log("init called")

  // activeInputSource=audioTagSource;
    audioTag = document.querySelector("audio#trackplayer");

    audioTagSource = audioTagSource || audioCtx.createMediaElementSource(audioTag);
    audioTagSource.connect(analyzerNodeList.inputAnalyzer);

    white_noise = PlayableAudioSource(audioCtx).random_noise(audioCtx);
    white_noise.connect(analyzerNodeList.inputAnalyzer);
    // white_noise.start();
    activeInputSource=white_noise;
    analyzerNodeList.inputAnalyzer.connect(pre_amp);
    for(let i =0; i<biquadFilters.length; i++){
        insert_dsp_filter(biquadFilters[i]);
    }
    post_amp.connect(analyzerNodeList.outputAnalyzer);
    analyzerNodeList.outputAnalyzer.connect(audioCtx.destination);

    init_eq_controls();
}
function init_eq_controls(){
 
    audioTag.addEventListener("canplay", console.log);
    audioTag.addEventListener("canplay|loadedmetadata|play|ended", console.log);
    hz_bands.forEach( (hz, i)=>{
        var row = eq_ui_row_template.content.cloneNode(true);
        row.querySelector(".hz_label").innerHTML = Number(hz).toFixed(2);
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
        if(!isNaN(amp)) document.getElementsByClassName("freq_resp_meter")[index].value = amp;
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


function debug(){
    var bew="";
    biquadFilters.forEach( b=> bew += "<br>"+b.frequency.value + "|"+ b.gain.value+" |"+b.Q.value);

    compressors.forEach( b=> bew += "<br>"+b.threshold.value + "|"+ b.ratio.value+" |"+b.knee.value);

    log(bew)
}

function setNewInput(input){
    if(activeInputSource!==null && activeInputSource !== input ){
        activeInputSource.disconnect();
    }
    activeInputSource = input;

    if(input instanceof AudioBufferSourceNode || input instanceof AudioScheduledSourceNode){
        input.start();
    }

    else if (input === 'audiotag'){
        activeInputSource = audioTag;
        audioTag.oncanplay = () =>audioTag.play();
    }
}
window.eq_stdin =  function(str){
    const cmd = str.split(" ")[0];
    const arg1 = str.split(" ")[1] || "";
    const arg2 = str.split(" ")[2] || "";
    initializeContext();
    const now = audioCtx.currentTime;

    var resp = "";
    switch(cmd){
        case 'init': initializeContext(); break;
        case "debug": debug(); break;
        case 'sine':         
            activeInputSource.disconnect();
            sinewave = audioCtx.createOscillator();
            let _few = (arg1 && parseInt(arg1)) || 60; 

            activeInputSource = sinewave;
            sinewave.frequency.setValueAtTime(_few, audioCtx.currentTime)
            sinewave.connect(inputAnalyzer);
            sinewave.start();
            break;
        case 'volume':
            return "current volumes are "+ pre_amp.volume.value + " postamp "+ post_amp + " "
        case 'toxic':
            activeInputSource!== null && activeInputSource.disconnect();
            audioTag.src="/samples/toxic.mp3";
            audioTag.oncanplay = e => audioTag.play();
            break;
        case 'b':
        case 'biquad':
             resp += "biquad "+bdex;

            if(!arg1){
                 biquadFilters.forEach( b=> resp += "<br>"+b.frequency.value + "|"+ b.gain.value+" |"+b.Q.value);
            }else{
                
                var amp_response = new Float32Array(hz_bands.length);
                var phase_shift = new Float32Array(hz_bands.length);
                var bdex = parseInt(arg1)
                var b = biquadFilters[bdex];
                resp += "<br>"+b.frequency.value + "|"+ b.gain.value+" |"+b.Q.value
                let fr = biquadFilters[bdex].getFrequencyResponse(hz_bands,amp_response, phase_shift );
                let resp = "biquad "+bdex;
                resp += "<br>amp resp "+JSON.stringify(amp_response, null,'\t') 
                resp += "<br>phase "+JSON.stringify(phase_shift, null,'\t')
            }
            break;
        case 'd':
            post_amp.gain.setValueAtTime(post_amp.gain.value-0.3, now);
            break;
        case 'u':
            post_amp.gain.setValueAtTime(post_amp.gain.value+0.3, now);
            break;
        case 'v':
        case 'yt':
        case 'video':
            var id = extractVideoID(arg1);
            if(!id) resp="cannnot parse id";
            else{
                audioTag.src="https://localhost:8000/yt?id="+id;
                setNewInput(audioTag);
            }
            break;
        case 'noise':
            white_noise.start();
            activeInputSource.disconnect();
            white_noise.connect(outputAnalyzer)
            break;
        case 'inputs':
            console.log(inputAnalyzer);
            break;
        case 'new':
            switch(args1){
                case 'b':
                case 'biquad':
                    var newb = audioCtx.createBiquadFilter();
                    var params = args[2];
                    try{
                        var newf = BiquadFilters.createFromString(params);
                        insert_dsp_filter(newf);
                        resp += "createing biquad "+ dd(newf);
                    }catch(e){
                        resp = "error: "+e.message;
                    }
                    break;         
            }
            break;

        default: 
            return eval(cmd)
            break;

        
    }
   return resp;


}
function extractVideoID(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if ( match && match[7].length == 11 ){
        return match[7];
    }else{
        return null;
    }
}
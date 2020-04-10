import BiquadFilters from './biquadFilters.js'

import io_samplers from './io_samplers.js'
import DynamicCompressionModule from './compression.js';
import PlayableAudioSource from './audio_source.js';
import './polyfills.js'
const NYQUIST_SAMPLE_RATE_x2 = 441000;
const NUM_FREQUENCY_BANDS = 14;

var configs = window.location.hash.includes("parallel") ? 3 : 1;
log('config ios ' + configs)

let audioCtx,pre_amp,post_amp;
var biquadFilters,compressors; //list of 16
let analyzerNodeList,mod_compressor;

let audioTagSource,micTagSource,white_noise,sinewave;
let inputAnalyzer,outputAnalyzer,audioTag;

let activeInputSource;
let userMediaStreamSource;


let volumeSamplers = [];
let letancySamplers = [];
var bqModule;


const startBtn = document.getElementById("start");
const getMicBtn = document.querySelector("#mic-check")
const playButton = document.getElementById("playBtn");
const rx1 = document.getElementById("rx1");
const volumeControl = document.getElementById("volume");
const volumeControl2 = document.getElementById("volume2");
const rx2 =  document.getElementById("rx2");

document.querySelectorAll("input[name=q]").forEach(d => d.min = '1.0');
document.querySelectorAll("input[name=gain]").forEach(d => d.value = 0.0);
window.logrx1 = (txt) => rx1.innerHTML = txt;
window.logrx2 = (txt) => rx2.innerHTML = txt;

volumeControl.addEventListener('input',() => pre_amp.gain.value = event.target.value);
volumeControl2.addEventListener('input',() => post_amp.gain.value = event.target.value);
getMicBtn.onclick = () =>
{
    PlayableAudioSource(audioCtx).getAudioDevice(audioCtx).then(source => source.connect(analyzerNodeList.inputAnalyzer));
}


const hz_bands = new Float32Array(
    32,64,125,
    250,500,1000,
    2000,4000,8000,
    16000,24000
);


window.post_data = function (arr, arg1, arg2)
{
    if (arr == 'freq_out') {

        var bincount = 9;
        var fftdata = arg1;
        var binWidth = 24400 / bincount;

        var sums = new Float32Array(hz_bands.length).fill(0);

        var max = 0;

        for (let i = 1; i <= fftdata.length; i++) {
            var freq = i * binWidth;
            let j;

            for (j = 0; hz_bands[j] < freq; j++);

            sums[j] += fftdata[i];


            if (sums[j] > max) max = sums[j];
        }

        if (max > 0) {
            debugger;
        }
        for (let j = 0; j < sums.count; j++) {
            fr_meters[j].max = max;
            fr_meters[j].value = sums[j];
        }
    }

    else if(arr=='freq_resp_update'){
        var chartdata = arg1;
        var meters =this.document.querySelectorAll("meter.freq_resp_meter");

        chartdata.forEach((v,i)=> meters[i].value = v);
    }
}


async function initializeContext(audioCtx)
{
    var ctx = audioCtx;

    audioTag = window.g_audioTag;

    sinewave = audioCtx.createOscillator();
    pre_amp = audioCtx.createGain(1);
    post_amp = audioCtx.createGain(1);
        
    mod_compressor = DynamicCompressionModule(audioCtx);
    mod_compressor.addDefaults(NUM_FREQUENCY_BANDS);
    compressors = mod_compressor.list;

    analyzerNodeList = io_samplers(audioCtx,2048);
    inputAnalyzer = analyzerNodeList.inputAnalyzer;
    outputAnalyzer = analyzerNodeList.outputAnalyzer;

    audioTagSource = audioTagSource || audioCtx.createMediaElementSource(audioTag);
    activeInputSource = audioTagSource;

    activeInputSource.connect(pre_amp);

    var splitter = ctx.createChannelSplitter(2);
    var splitter2 = ctx.createChannelSplitter(2);

    activeInputSource.connect(splitter);
    splitter.connect(inputAnalyzer);



    bqModule = new BiquadFilters(audioCtx);
    biquadFilters = bqModule.default_filters();
 

    var cursor = splitter;
    for (const filter of biquadFilters) {
        cursor.connect(filter);
        cursor = filter;
    }
    cursor.connect(post_amp);

    post_amp.connect(splitter2);
    splitter.connect(audioCtx.destination)
    splitter.connect(outputAnalyzer);
  


    analyzerNodeList.run_samples(audioCtx);

    white_noise = PlayableAudioSource(audioCtx).random_noise(audioCtx);
    debugger;

    white_noise.connect(post_amp);
    white_noise.start();

    white_noise.stop(audioCtx.currentTime+2);
    audioCtx.onstatechange = function (ev)
    {
        switch (ev.target.state) {
            case "running": analyzerNodeList.run_samples(audioCtx); break;
            default: analyzerNodeList.stop();
        }
        return false;
    }
}



function debug()
{
    var bew = "";
    log(bqModule.to_string());
    log()
    log(bew);

}

function eq_stdin(str)
{


    const cmd = str.split(" ")[0];
    const arg1 = str.split(" ")[1] || "";
    const arg2 = str.split(" ")[2] || "";
    audioCtx = audioCtx || window.g_audioCtx;
    const now = audioCtx.currentTime;

    var resp = "";
    switch (cmd) {
        case 'rreset': audioCtx = null && initializeContext(); break;
        case 'init': initializeContext(); break;
        case "debug": debug(); break;
        case 'sine':
            // activeInputSource.disconnect();
            sinewave = audioCtx.createOscillator();
            let _few = (arg1 && parseInt(arg1)) || 60;

            activeInputSource = sinewave;
            sinewave.frequency.setValueAtTime(_few,audioCtx.currentTime)
            sinewave.connect(inputAnalyzer);
            sinewave.start();
            break;
        case 'volume':
            return "current volumes are " + pre_amp.volume.value + " postamp " + post_amp + " "
        case 'toxic':
            activeInputSource !== null && activeInputSource.disconnect();
            audioTag.src = "/samples/toxic.mp3";
            audioTag.oncanplay = e => audioTag.play();
            break;
        case 'b':
        case 'biquad':
            resp += "biquad " + bdex;

            if (!arg1) {

            } else {
                let fr = biquadFilters[bdex].getFrequencyResponse(hz_bands,amp_response,phase_shift);


                var amp_response = new Float32Array(hz_bands.length);
                var phase_shift = new Float32Array(hz_bands.length);
                var bdex = parseInt(arg1)
                var b = biquadFilters[bdex];
                resp += "<br>" + b.frequency.value + "|" + b.gain.value + " |" + b.Q.value

                resp += "biquad " + bdex;
                resp += "<br>amp resp " + amp_response.join(",");
                ;
            }
            break;
        case 'd':
            post_amp.gain.setValueAtTime(post_amp.gain.value - 0.3,now);
            break;
        case 'u':
            post_amp.gain.setValueAtTime(post_amp.gain.value + 0.3,now);
            break;
        case 'q':
        case 'search':
            var id = query(arg1);
            if (!id) resp = "cannnot parse id";
            else {
                audioTag.src = "https://localhost:8000/yt?id=" + id;
                setNewInput(audioTag);
            }
            break;
        case 'v':
        case 'yt':
        case 'video':
            var id = extractVideoID(arg1);
            if (!id) resp = "cannnot parse id";
            else {
                audioTag.src = "https://localhost:8000/yt?id=" + id;
                setNewInput(audioTag);
            }
            break;
        case 'noise':
            white_noise = PlayableAudioSource(audioCtx).random_noise(audioCtx);
            white_noise.connect(analyzerNodeList.inputAnalyzer);
            white_noise.start();
            var duration = arg1 && parseInt(arg1) || 60;
            white_noise.stop(now + duration);
            white_noise.onstopped = e => white_noise.disconnect();
            break;
        case 'inputs':
            console.log(inputAnalyzer);
            break;
        case 'new':
            switch (args1) {
                case 'b':
                case 'biquad':
                    var newb = audioCtx.createBiquadFilter();
                    var params = args[2];
                    try {
                        var newf = BiquadFilters.createFromString(params);
                        insert_dsp_filter(newf);
                        resp += "createing biquad " + dd(newf);
                    } catch (e) {
                        resp = "error: " + e.message;
                    }
                    break;
                default: break;
            }
            break;
        case 'reset':
            biquadFilters = [];
            break;


        default:
            resp = "cmd.."
            break;


    }
    return resp;


}



function query(q)
{
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

    var url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
    fetch(url,{ mode: 'no-cors' }).then(resp => resp.text()).then(text => text.match(regExp))
        .then(match =>
        {
            debugger;
            if (match && match[7].length > 11) {
                return match[7];
            } else {
                return null;
            }
        })

}
function extractVideoID(url)
{
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[7].length == 11) {
        return match[7];
    } else {
        return null;
    }
}

window.eq_stdin= eq_stdin;
export default {
    initializeContext,
    eq_stdin
}
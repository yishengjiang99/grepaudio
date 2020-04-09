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



const startBtn = document.getElementById("start");
const getMicBtn = document.querySelector("#mic-check")
const playButton = document.getElementById("playBtn");
const rx1 = document.getElementById("rx1");
const volumeControl = document.getElementById("volume");
const volumeControl2 = document.getElementById("volume2");


document.querySelectorAll("input[name=q]").forEach(d => d.min = '1.0');
document.querySelectorAll("input[name=gain]").forEach(d => d.value = 0.0);
window.logrx1 = (txt) => rx1.innerHTML = txt;


audioTag = initAudioTag("#ctrls");


volumeControl.addEventListener('input',() => pre_amp.gain.value = event.target.value);
volumeControl2.addEventListener('input',() => post_amp.gain.value = event.target.value);
getMicBtn.onclick = () =>
{
    PlayableAudioSource(audioCtx).getAudioDevice(audioCtx).then(source => source.connect(analyzerNodeList.inputAnalyzer));
}
document.body.addEventListener("click",function (e) { initializeContext() },{ once: true });


function setupConfig2()
{

}

const hz_bands = new Float32Array(
    32,64,125,
    250,500,1000,
    2000,4000,8000,
    16000,24000
);


window.post_data = function (arr,fftdata,bincount)
{
    if (arr == 'freq_out') {


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
}


function initializeContext()
{
    if (!audioCtx) {
        audioCtx = new AudioContext();
    } else {
        return;

    }

    audioCtx = new AudioContext();
    audioCtx.onstatechange = function (ev)
    {
        switch (ev.target.state) {
            case "running": analyzerNodeList.run_samples(audioCtx); break;
            default: logrx1('ctx state' + ev.target.state); break;
        }
        return false;
    }
    logrx1("ty");
    sinewave = audioCtx.createOscillator();
    pre_amp = audioCtx.createGain();

    post_amp = audioCtx.createGain();

    mod_compressor = DynamicCompressionModule(audioCtx);
    mod_compressor.addDefaults(NUM_FREQUENCY_BANDS);
    compressors = mod_compressor.list;

    var gains = Array(16).fill(0);
    var bandwidths = Array(16).fill(8);


    analyzerNodeList = io_samplers(audioCtx,2048);

    inputAnalyzer = analyzerNodeList.inputAnalyzer;
    outputAnalyzer = analyzerNodeList.outputAnalyzer;
    log("init called")




    audioTagSource = audioTagSource || audioCtx.createMediaElementSource(audioTag);
    audioTagSource.connect(analyzerNodeList.inputAnalyzer);




    if (configs == 1) {
        biquadFilters = BiquadFilters.default_filters(audioCtx);
        activeInputSource = audioTag;
        analyzerNodeList.inputAnalyzer.connect(pre_amp);
        var cursor = pre_amp;
        for (const filter of biquadFilters) {
            cursor.connect(filter);
            cursor = filter;
        }

        post_amp.connect(analyzerNodeList.outputAnalyzer);
        analyzerNodeList.outputAnalyzer.connect(audioCtx.destination);
    }

    cursor.connect(post_amp);
    post_amp.connect(analyzerNodeList.outputAnalyzer);
    analyzerNodeList.outputAnalyzer.connect(audioCtx.destination);

    document.querySelector("#eq_update_form").addEventListener("input",function (e)
    {

        if (audioCtx === null) initializeContext();
        var value = e.target.value;
        var i = e.target.dataset.index;

        switch (e.target.name) {
            case "gain":
                biquadFilters[i].gain.setValueAtTime(value,audioCtx.currentTime + 1); break;
            case "q":
                biquadFilters[i].Q.setValueAtTime(value,audioCtx.currentTime + 1); break;
            case "threshold":
            case "ratio":
            case "knee":
            case "attack":
            case "release":
                mod_compressor.getAttributeValue(compressors[i],e.target.name).setValueAtTime(value,audioCtx.currentTime + 1);
                break;
            default: /*wtf*/ break;
        }

        // if(e.target.type=='range'){
        //     e.target.parentElement.parentElement.getElementsByClassName(e.target.name+"_label")[0].innerHTML = e.target.value;
        // }
        var frps = BiquadFilters.aggregate_frequency_response(biquadFilters,hz_bands);

        var meters = document.getElementsByClassName("freq_resp_meter");


        frps.forEach((amp,index) =>
        {
            if(amp > 0) log(index+": "+amp);
            
            meters[index].value = amp+"";
     
        });
    });
}



function debug()
{
    var bew = "";
    biquadFilters.forEach(b => bew += "<br>" + b.frequency.value + "|" + b.gain.value + " |" + b.Q.value);

    compressors.forEach(b => bew += "<br>" + b.threshold.value + "|" + b.ratio.value + " |" + b.knee.value);
}

window.eq_stdin = function (str)
{
    initializeContext();
    const cmd = str.split(" ")[0];
    const arg1 = str.split(" ")[1] || "";
    const arg2 = str.split(" ")[2] || "";

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

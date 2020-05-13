import { slider } from "./functions.js";
import Envelope from './envelope.js';

function Effects(ctx, paraams) {
    const params = {
        min: 0
        , max: 4
        , attack: 0.1
        , decay: 0.25
        , sustain: 0.22
        , release: 0.21//0.01
        , waveUrl: '/samples/Piano'
        , ...paraams
    };

    var octave = 4;
    var freqmultiplierindex = [0,0.25, 0.5, 1, 2, 4];


    const { min, max, attack, decay, sustain, release } = params;
    const keys = 'a,w,s,e,d,f,t,g,y,h,u'.split(",");
    const notes = '261.63, 293.66 , 329.63, 349.23, 392.00, 440.00, 493.88, 277.18, 311.13, 369.99, 415.30, 466.16'.split(",").sort();
    var masterGain = new GainNode(ctx, { gain: 1 })
    var waveform = null;

    fetch(params.waveUrl).then(resp => resp.text()).then(str=>JSON.parse(str)).then(json=>{
        waveform = ctx.createPeriodicWave(json.real, json.imag);
    })
    var adsrs = {};
    var  convolver = ctx.createConvolver();

    var impulse = ctx.createBuffer(2, 3*ctx.sampleRate, ctx.sampleRate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);

    var n, i;
  
    for (i = 0; i < 3*ctx.sampleRate; i++) {
     
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
debugger;
  //  convolver.buffer = impulse;

    
    function createKey(i) {
        var freq_multiplier = freqmultiplierindex[octave];
        var osc1 = ctx.createOscillator();
        osc1.frequency.value = notes[i] * freq_multiplier;
        osc1.type = 'sine'
    
     
        var osc2 = ctx.createOscillator();
        osc2.frequency.value = notes[i] * freq_multiplier * 2;
        osc2.type = 'square'
        var offfreq_attenuator = new GainNode(ctx,{gain:0.1});

        var gain =new GainNode(ctx,{gain:0})

        if(waveform){
            osc1.setPeriodicWave(waveform)
            osc1.setPeriodicWave(waveform)
        }
        if (convolver.buffer) {
            osc1.connect(convolver).connect(gain)
             osc2.connect(offfreq_attenuator).connect(convolver).connect(gain)
        }else{
            osc2.connect(offfreq_attenuator).connect(gain);
            osc1.connect(gain);
        }
        
        var gainEnvelope = new Envelope(min, max, attack, decay, sustain, release, gain.gain);
        adsrs[i] = gainEnvelope

        osc1.start(0);
        osc2.start(0);



        gain.connect(masterGain)
        return gainEnvelope;
    }
    window.addEventListener("keydown", function(e) {
        var i = keys.indexOf(e.key);

        if (i > -1) {
            if (!adsrs[i]) {
                adsrs[i] = createKey(i);
            }
            var env = adsrs[i];

            if (e.repeat) {
                env.hold(ctx.currentTime);
            } else {
                env.trigger(ctx.currentTime);
            }
        }
    })

    var quicksample = (buffer)=>{
        var b = ctx.createBufferSource();
        var g = new GainNode(ctx,{gain:2})
        b.connect(g).connect(ctx.destination)
        b.buffer = buffer;
        b.start(0);
        b.stop(1);
    }

    var setImpulse = (impulseUrl) =>{
        if (!impulseUrl) return;

        fetch(impulseUrl).then(resp => resp.arrayBuffer()).then(buffer => ctx.decodeAudioData(buffer))
            .then(audioBuffer => {
                quicksample(audioBuffer);
      
                convolver.buffer = audioBuffer;
                convolver.loop = true;
                return convolver;
            })
    }

    window.addEventListener("keyup", function(e) {
        if (keys.indexOf(e.key) > -1) {
            var env = adsrs[keys.indexOf(e.key)];
            env.release(ctx.currentTime);
        }
    })

    function loadUI(containerId){
        var list = document.createElement("ul");
        var container  = document.getElementById(containerId);
        container.style.height=200;
        list.style.overflowY='scroll'
        container.appendChild(list);

    
        impulsesfff.map(filename => {
            const display = filename.split(".")[0];
            const url = '/samples/impulses/' + filename;
            var btn = document.createElement("button");
            btn.onclick = (e) => {
                this.setImpulse(url)
            }
            btn.innerHTML = display;
    
            const li = document.createElement("li")
            li.appendChild(btn);
            // li.appendstr(display)
            log(display, url)
            list.appendChild(li)
        })
        
    }

    async function setWaveShaper(waveShaperUrl) {
        if (!waveShaperUrl) return;
        var str = await fetch(waveShaperUrl).then(resp => resp.text());
        var json = await JSON.parse(str);
        this.waveShaper = ctx.createPeriodicWave(json.real, json.imag)
    }
    return {
        masterGain,
        convolver,
        setWaveShaper,
        loadUI,
        setImpulse
        
    }
}



export default Effects;

const impulsesfff =
    `backslap1.wav
    backwards-2.wav
    backwards-4.wav
    bright-hall.wav
    chorus-feedback.wav
    comb-saw1.wav
    comb-saw2.wav
    comb-saw3.wav
    comb-saw4.wav
    comb-square1.wav
    comb-square2.wav
    comb-square3.wav
    cosmic-ping-long.wav
    cosmic-ping-longdrive.wav
    cosmic-ping.wav
    cosmic-ping2.wav
    crackle.wav
    crosstalk.wav
    diffusor1.wav
    diffusor2.wav
    diffusor3.wav
    diffusor4.wav
    echo-chamber.wav
    feedback-spring.wav
    filter-hipass5000.wav
    filter-lopass160.wav
    filter-midbandpass.wav
    filter-rhythm1.wav
    filter-rhythm2.wav
    filter-rhythm3.wav
    filter-rhythm4.wav
    filter-telephone.wav
    hihat-rhythm.wav
    imp_sequence.wav
    impulse-rhythm1.wav
    impulse-rhythm2.wav
    matrix-reverb1.wav
    matrix-reverb2.wav
    matrix-reverb3.wav
    matrix-reverb4.wav
    matrix-reverb5.wav
    matrix-reverb6.wav
    matrix6-backwards.wav
    medium-room1.wav
    medium-room2.wav
    noise-spreader1.wav
    peculiar-backwards.wav
    sifter.wav
    smooth-hall.wav
    spatialized1.wav
    spatialized11.wav
    spatialized15.wav
    spatialized16.wav
    spatialized17.wav
    spatialized2.wav
    spatialized3.wav
    spatialized4.wav
    spatialized5.wav
    spatialized6.wav
    spatialized7.wav
    spatialized8.wav
    spatialized9.wav
    spreader10-85ms.wav
    spreader25-125ms.wav
    spreader25-55ms.wav
    spreader25ms.wav
    spreader35ms.wav
    spreader50-65ms.wav
    spreader55-75ms.wav
    spreader55ms-2.wav
    spreader55ms.wav
    wildecho-old.wav
    wildecho.wav
    zing-long-stereo.wav
    zoot.wav
    `.split(/\s+/);

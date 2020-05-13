import { slider } from "./functions.js";
import Envelope from './envelope.js';

async function Effects(ctx, paraams) {
class Effects extends AudioNode {
    constructor(ctx, params){
        const params = {
            min: 0
            , max: 0.5
            , attack: 0.15
            , decay: 0.21
            , sustain: 0.21
            , release: 0.01
            , waveUrl: '/samples/Piano'
            , ...paraams
        };
        super(ctx, params);
        
    }

    var str = await fetch(params.waveUrl).then(resp => resp.text());
    var json = await JSON.parse(str);

    const keys = 'a,w,s,e,d,f,t,g,y,h,u'.split(",");
    const notes = '261.63, 293.66 , 329.63, 349.23, 392.00, 440.00, 493.88, 277.18, 311.13, 369.99, 415.30, 466.16'.split(",").sort();
    this.masterGain = new GainNode(ctx, { gain: 1 })

    var adsrs = [];
    var waveform = ctx.createPeriodicWave(json.real, json.imag);
    var convolverNode = ctx.createConvolver();

    var _reverbUrl = null;
    var _reverbBuffer = null;
    
    function createKey(i) {
        var osc1 = ctx.createOscillator();
        osc1.frequency.value = notes[i];
        osc1.type = 'sine'
    
        if (_reverbBuffer) {
            
            osc1.connect(convolver).connect(gain1)
        }else{
            osc1.connect(gain1)
        }
        var osc2 = ctx.createOscillator();
        osc2.frequency.value = notes[i] * 2;
        osc2.type = 'sawtooth'
        osc2.deturn = 100;
        var gain1 = ctx.createGain(2);
        gain.gain.value = 0;


        osc1.setPeriodicWave(waveform)
        var gainEnvelope = new Envelope(min, max, attack, decay, sustain, release, gain.gain);
        adsrs[i] = gainEnvelope
        osc2.connect(gain);
        osc1.connect(gain);
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
            lastkeydown[e.key] = ctx.currentTime;
        }
    }),

    function setImpulse(impulseUrl){
        if (!impulseUrl) return;

        fetch(impulseUrl).then(resp => resp.arrayBuffer()).then(buffer => ctx.decodeAudioData(buffer))
            .then(audioBuffer => {
                var impulseResponseBuffer = audioBuffer;
                convolver = ctx.createConvolver();
                convolver.buffer = impulseResponseBuffer;
                convolver.loop = true;
                convolver.start(0);
                return convolver;
            })
    }

    window.addEventListener("keyup", function(e) {
        if (keys.indexOf(e.key) > -1) {
            var env = adsrs[keys.indexOf(e.key)];
            env.release(ctx.currentTime);
        }
    })



    async function setWaveShaper(waveShaperUrl) {
        if (!waveShaperUrl) return;
        var str = await fetch(waveShaperUrl).then(resp => resp.text());
        var json = await JSON.parse(str);
        this.waveShaper = ctx.createPeriodicWave(json.real, json.imag)
    }
    return {
        masterGain,

        
    }

Effects.prototype = Object.create(null, {

    /*
     * @param reverb: url
     */
    reverbUrl: {
        enumerable: true,
        get: function() { this._reverbUrl },
        set: function(url) { this._reverbUrl=url && this.setImpulse(url) }
    },
    output:{
        get: function() {this.mastNode},

        }

});

Effects.prototype.connect = function (node){
    this.masterGain = node;
}
Effects.loadUI=function(containerId){
        var list = document.createElement("ul");
        var container  = document.getElementById(containerId);
        container.appendChild(list);

    
        impulsesfff.map(filename => {
            const display = filename.split(".")[0];
            const url = '/samples/impulses/' + filename;
            var btn = document.createElement("button");
            btn.onclick = (e) => {
                this.reverbUrl = url;
            }
            btn.innerHTML = display;
    
            const li = document.createElement("li")
            li.appendChild(btn);
            // li.appendstr(display)
            log(display, url)
            list.appendChild(li)
        })
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

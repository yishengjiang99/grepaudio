import { slider } from "./functions.js";
import Envelope from './envelope.js';

function Effects(ctx,params){
    params = {
        min: 0, max: 0.5, attack: 0.15, decay: 0.21, sustain: 0.21, release: 0.01,
        waveformURL: '/samples/piano',
        impulseUrl: null,
        ...params
    }

    var { min, max, attack, decay, sustain, release, waveformURL ,impulseUrl} = params;

	const keys = 'asdfghj'.split("");
	const notes = '261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88'.split(", ");

	var masterGain = ctx.createGain();
	masterGain.gain.setValueAtTime(1, ctx.currentTime)
    var wetGain = ctx.createGain();
    wetGain.gain.value = 1.3
    var wetDelay = ctx.createDelay();
    wetDelay.delayTime.value = 0.1;
	var adsrs = {};

	var convolver = null;
    var waveShaper =null;
    var loaded = false;

    function connect(node){
        this.masterGain.connect(node)
    }
    function loadUI(containerId, inputNode, outputNode) {
        var list = document.createElement("ul");
        var container  = document.getElementById(containerId);
        container.appendChild(list);
    
        this.inputNode = inputNode;
        this.outputNode = outputNode;
    
        impulsesfff.map(filename => {
            const display = filename.split(".")[0];
            const url = '/samples/impulses/' + filename;
            var btn = document.createElement("button");
            btn.onclick = (e) => {
                setImpulse(url);
            }
            btn.innerHTML = display;
    
            const li = document.createElement("li")
            li.appendChild(btn);
            // li.appendstr(display)
            log(display, url)
            list.appendChild(li)
        })
        $("#" + containerId).appendChild(list);
        slider(container, { label: "wet gain", prop: wetGain.gain, min: "0", max: "4" });
        slider(container, { label: "wet delay", prop: wetDelay.delayTime });
    }
	function setImpulse(impulseUrl){
        if(!impulseUrl) return;
        
        fetch(impulseUrl).then(resp => resp.arrayBuffer()).then(buffer => ctx.decodeAudioData(buffer))
        .then(audioBuffer=>{
            var impulseResponseBuffer = audioBuffer;
            convolver = ctx.createConvolver();
            convolver.buffer = impulseResponseBuffer;
        })
	}

	async function setWaveShaper(waveShaperUrl){
        if(!waveShaperUrl) return;
		var str = await fetch(waveShaperUrl).then(resp => resp.text());
		var json = await JSON.parse(str);
		this.waveShaper =g_audioCtx.createPeriodicWave(json.real, json.imag)
	}
    
	function createEnvelope(i){

        var LFO = ctx.createOscillator();
		LFO.frequency.value = notes[i];
		LFO.type = 'square'
		var gain = ctx.createGain();
		gain.gain.value = 0;
        if(waveShaper){
            LFO.setPeriodicWave(waveShaper);

        }
        
		var gainEnvelope = new Envelope(min, max, attack, decay, sustain, release, gain.gain);
		adsrs[i] = gainEnvelope;
		LFO.connect(gain);
		gain.connect(masterGain)
        LFO.start(0);
        
        // var LFO = ctx.createOscillator();
		// LFO.frequency.value = notes[index];
		// LFO.type = 'sine'
		// if(waveShaper) {
		// 	LFO.setPeriodicWave(waveShaper);
		// }

		// var gain = ctx.createGain();
		// gain.gain.value = 0;
		// LFO.connect(gain).connect(masterGain)
		// if(convolver){
        //     LFO.connect(convolver);
        //     convolver.connect(wetDelay).connect(wetGain).connect(gain);
		// }
		// var gainEnvelope = new Envelope(min, max, attack, decay, sustain, release, gain.gain);
		// adsrs[index]= gainEnvelope;
		// gain.connect(masterGain)
		// LFO.start(0);
  
		return gainEnvelope;
    }
    
	window.addEventListener("keydown", function (e) {
		var index = keys.indexOf(e.key);
		if (index > -1) {
			var env = adsrs[index] || createEnvelope(index);
			if (e.repeat) {
				env.hold(ctx.currentTime);
			} else {
				env.trigger(ctx.currentTime);
			}
			//lastkeydown[e.key] = ctx.currentTime;
		}
	})

	window.addEventListener("keyup", function (e) {
        var index = keys.indexOf(e.key);

		if (index > -1) {
			var env = adsrs[index];
            env.release(ctx.currentTime);
            //delete adsrs[index];
			log("keyup")
		}
	})
	return{
		masterGain,
		setWaveShaper,
        setImpulse,
        loadUI,
        connect
	}

}
// Effects.prototype = Object.create(null, {
//     connect: function(node){
//         this.masterGain.connect(node);
//     }
// });

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
export default Effects;

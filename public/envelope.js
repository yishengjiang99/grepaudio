

export default function Envelope(min, max, attack, decay, sustain, release, param) {
    this.min = min; //
    this.max = max;
    this.attack = attack;
    this.releaseTimeConstant = release;
    this.sustain = sustain;
    this.decay = decay;
    this.param = param;
}

Envelope.prototype.trigger = function (time) {

    if(this.attackTime == null ){
        this.param.linearRampToValueAtTime(this.max, time+this.attack);
        this.attackTime = time+this.attack;
        this.param.exponentialRampToValueAtTime(this.sustain, time + this.attack + this.decay);
    }else{
        this.param.exponentialRampToValueAtTime(this.sustain, time + this.decay);

    }
}

Envelope.prototype.release = function (time) {
    this.param.exponentialRampToValueAtTime(this.sustain, time + this.attack + this.decay);
    this.sustainTime = time + this.decay;
    this.param.setTargetAtTime(this.min, this.sustainTime+this.decay, this.releaseTimeConstant);
    this.attackTime = null;
}


Envelope.defaultPackage=function(context) {
    var buffer = context.createBuffer(1, 128, context.sampleRate);
    var p = buffer.getChannelData(0);

    for (var i = 0; i < 128; ++i)
        p[i] = 1;

    var source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start(0);

    return source;
}
Envelope.ControlSignal = function (context, unitySource, initialValue) {
    this.output = context.createGain();
    this.output.gain.value = initialValue;
    unitySource.connect(this.output);
}


// function etst() {
//     var gain = ctx.createGain(1);

//     var note = new Envelope(2, 5, 2, 3, 4, 2, gain.gain);

//     var context = ctx;
//     var ampEnvelopeGain = context.createGain();

//     var ampAttack = 0.020;
//     var ampDecay = 0.300;
//     var ampSustain = 85;
//     var ampRelease = 0.250;

//     var amplop = new Envelope(ampAttack, ampDecay, ampSustain, ampRelease, ampEnvelopeGain);

//     var gainNode = context.createGain();
//     gainNode.gain.value = 0.25 * 1;

//     var filter = context.createBiquadFilter();
//     filter.Q.value = 0;
//     filter.frequency.value = 0;
//     filter.connect(gainNode);

//     gainNode.connect(amplop);

//     var lfo = context.createOscillator();
//     lfo.frequency.value = 30;
//     lfo.type = "triangle";

//     var lfoDepth = context.createGain();
//     lfoDepth.gain.value = LFODEPTH;


//     var velEnvAttack = Math.pow(gain, 0.75);
//     var filterSustainCents = velEnvAttack * filterEnvAmount * 0.01 * filterSustain;
//     var minFilterFrequency = 40;
//     var maxFilterFrequency = minFilterFrequency * Math.pow(2, velEnvAttack * filterEnvAmount / 1200);
//     var sustainFrequency = minFilterFrequency * Math.pow(2, filterSustainCents / 1200);


//     var filterEnvelope1 = new Envelope(filterAttack, filterDecay, sustainFrequency, filterRelease, minFilterFrequency, maxFilterFrequency, filter.frequency);


// }

function split_band(input, low_freq, high_freq){
    var ctx = input.context;
    var Q = ctx.createConstantSource();

    var lpf = input.context.createBiquadFilter();
    lpf.frequency.value = low_freq;
    lpf.type='lowpass';
    Q.connect(lpf.Q);
    

    var lhpf = input.context.createBiquadFilter();
    lhpf.frequency.value = low_freq;
    lhpf.type = 'highpass'
    Q.connect(lhpf.Q);


    var hlpf = input.context.createBiquadFilter();
    hlpf.frequency.value = high_freq;
    hlpf.type = 'lowpass'
    Q.connect(hlpf.Q);

    var hpf = input.context.createBiquadFilter();
    hpf.frequency.value = high_freq;
    hpf.type = 'lowpass'
    Q.connect(hpf.Q);

    input.disconnect();
    input.connect(lpf);
    input.connect(lhpf);
    input.connect(hpf);
    input.connect(hpf);

    var masterGain = ctx.createGain();
    var preamp = ctx.createGain();   
    // var passthrough_components = [

    // ]
    var passthrough_compression = 0;

    var compressors = [
        ctx.createDynamicsCompressor(),
        ctx.createDynamicsCompressor(),
        ctx.createDynamicsCompressor()
    ]
    var gains = [
        ctx.createGain(0),
        ctx.createGain(0),
        ctx.createGain(0),
    ]
    var fbcDelay = Array(3).fill(ctx.createDelay());
    var fbcAttenuate = Array(3).fill(ctx.createGain());
    var fftProbe = Array(3).fill(ctx.createAnalyser());


    
    var low = input.connect(preamp).connect(lpf).connect(compressors[0]).connect(gains[0]).connect(masterGain)
    var high = input.connect(preamp).connect(hpf).connect(compressors[1]).connect(gains[1]).connect(masterGain)
    var mid = input.connect(preamp).connect(hlpf).connect(lhpf).connect(compressors[2]).connect(gains[2]).connect(masterGain)
   
    low.connect(fbcDelay[0]).connect(fbcAttenuate[0]).connect(masterGain);
    high.connect(fbcDelay[1]).connect(fbcAttenuate[1]).connect(masterGain);
    mid.connect(fbcDelay[2]).connect(fbcAttenuate[2]).connect(masterGain);
    
    return {
        bands:[low,high,mid],
        output: masterGain
    }
    
}
export default split_band;
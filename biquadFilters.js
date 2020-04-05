var biquadFilters = [];
var freq_bands_; 

function get_list(audioCtx, freq_bands, gain_factors, bandwidths){
    freq_bands_ = freq_bands;
    var num_nodex = freq_bands.count;
    for( let index in freq_bands){
        var filter = audioCtx.createBiquadFilter();
        var freq = freq_bands[index];
        var gain = gain_factors[index];
        var q = bandwidths[index];

        filter.type = "peaking"

        filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
        filter.gain.setValueAtTime(gain,      audioCtx.currentTime);
        filter.Q.setValueAtTime(q,      audioCtx.currentTime);

        biquadFilters.push(filter);
    }
    return biquadFilters;
}

function create(audioCtx, freq, type, gain, q){
        var filter = audioCtx.createBiquadFilter();
        filter.type = type;
        filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
        filter.gain.setValueAtTime(gain,      audioCtx.currentTime);
        filter.Q.setValueAtTime(q,      audioCtx.currentTime);
        return filter;
}
function aggregate_frequency_response(filters, frequency_list){
    frequency_list = frequency_list || SIXTEEN_BAND_FREQUENCY_RANGE;
    
    var aggregateAmps = Array(frequency_list.length).fill(0);
   
    for(let i in filters){
        var filter = filters[i];
        var amp_response = new Float32Array(frequency_list.length);
        var phase_shift = new Float32Array(frequency_list.length);
        filter.getFrequencyResponse(frequency_list,amp_response,phase_shift);
        amp_response.forEach((val,i)=>{
            aggregateAmps[i] += Math.log10(val) * 20;
        })
    }
    return aggregateAmps;
}

function createFromString(audioCtx, string){
    var params = string.split("|");
    var freq = params[0] || 60;
    var gain = params[1] || 5;
    var q = params[2] || 4;
    var type = params[1] || "peaking";
    return create(audio, freq, type,gain,q);

}

function dd(filter){
    return `type ${filter.type} freq: ${filter.frequency.value} gain ${filter.Q.value}`
}
export default {
    biquadFilters: biquadFilters,
    get_list,
    aggregate_frequency_response,createFromString,create
}
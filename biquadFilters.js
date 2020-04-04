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

        filter.type = index === 0 ? "highpass" : index === num_nodex - 1 ? "lowpass" : "peaking";

        filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
        filter.gain.setValueAtTime(gain,      audioCtx.currentTime);
        filter.Q.value = q;

        biquadFilters.push(filter);
    }
    return biquadFilters;
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


export default {
    biquadFilters: biquadFilters,
    get_list,
    aggregate_frequency_response
}
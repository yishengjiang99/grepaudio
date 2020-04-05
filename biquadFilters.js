var biquadFilters = [];


function default_filters(audioCtx)
{
    const bars = [{ "label": "32","f": 32,"gain": 0,"type": "lowshelf" },{ "label": "64","f": 64,"gain": 0,"type": "peaking" },{ "label": "125","f": 125,"gain": 0,"type": "peaking" },{ "label": "250","f": 250,"gain": 0,"type": "peaking" },{ "label": "500","f": 500,"gain": 0,"type": "peaking" },{ "label": "1k","f": 1000,"gain": 0,"type": "peaking" },{ "label": "2k","f": 2000,"gain": 0,"type": "peaking" },{ "label": "4k","f": 4000,"gain": 0,"type": "peaking" },{ "label": "8k","f": 8000,"gain": 0,"type": "peaking" },{ "label": "16k","f": 16000,"gain": 0,"type": "highshelf" }];
    biquadFilters= bars.map(obj =>
    {
        var filter = audioCtx.createBiquadFilter();
        filter.type = obj.type || 'lowpass';
        filter.gain.value = obj.gainValue || 0;
        filter.Q.value = 1;
        filter.frequency.value = obj.f || 0;
        filter.label = obj.label;
        return filter;
        
    })
    return biquadFilters;
}
function get_list(audioCtx,freq_bands,gain_factors,bandwidths)
{
    for (let index in freq_bands) {
        var filter = audioCtx.createBiquadFilter();
        var freq = freq_bands[index];
        var gain = gain_factors[index];
        var q = bandwidths[index];

        if (index == 0) filter.type = 'highself';
        else if (index == num_nodes - 1) filter.type = 'lowshelf';
        else filter.type = 'peaking';

        filter.frequency.setValueAtTime(freq,audioCtx.currentTime);
        filter.gain.setValueAtTime(gain,audioCtx.currentTime);
        filter.Q.setValueAtTime(q,audioCtx.currentTime);

        biquadFilters.push(filter);
    }
    return biquadFilters;
}



function create(audioCtx,freq,type,gain,q)
{
    var filter = audioCtx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq,audioCtx.currentTime);
    filter.gain.setValueAtTime(gain,audioCtx.currentTime);
    filter.Q.setValueAtTime(q,audioCtx.currentTime);
    return filter;
}
function aggregate_frequency_response(filters,frequency_list)
{


    var aggregateAmps = Array(frequency_list.length).fill(0);

    for (let i in filters) {
        var filter = filters[i];
        var amp_response = new Float32Array(frequency_list.length);
        var phase_shift = new Float32Array(frequency_list.length);
        filter.getFrequencyResponse(frequency_list,amp_response,phase_shift);
        amp_response.forEach((val,i) =>
        {
            aggregateAmps[i] += Math.log10(val) * 20;
        })
    }

    return aggregateAmps;
}

function createFromString(audioCtx,string)
{
    var params = string.split("|");
    var freq = params[0] || 60;
    var gain = params[1] || 5;
    var q = params[2] || 4;
    var type = params[1] || "peaking";
    return create(audio,freq,type,gain,q);

}

function dd(filter)
{
    return `type ${filter.type} freq: ${filter.frequency.value} gain ${filter.Q.value}`
}



export default {
    biquadFilters: biquadFilters,
    default_filters,
    aggregate_frequency_response,createFromString,create
}

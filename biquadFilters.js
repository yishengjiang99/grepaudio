


function biquad_filter_list(freq_bands,gain_factors, bandwidths, beqContainer)
{
    biquadFilters = [];
    for( let index in freq_bands){
        var filter = audioCtx.createBiquadFilter();
        var freq = freq_bands[index];
        var gain = gain_factors[index];
        var q = bandwidths[index];

        filter.type = index === 0 ? "lowshelf" : (index === num_nodex - 1 ? "highshelf" : "peaking");
        filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
        filter.gain.setValueAtTime(gain,      audioCtx.currentTime);
        filter.Q.setValueAtTime(q, audioCtx.currentTime);
        biquadFilters.push(filter);
    }

    beqContainer !== null && biquadFilters.forEach((filter,index) =>
    {
        var freq = freq_bands[index];
        var label = document.createElement("span");
        label.innerHTML = freq + " Hz";

        var control = document.createElement("input");
        control.type = "range";
        control.value = filter.gain.value;
        control.min = 0;
        control.max = 20;
        control.index = index;

        var valueLabel = document.createElement("span");
        valueLabel.innerHTML = filter.gain.value;
        control.addEventListener("input",(e) =>
        {
            gain = parseFloat(e.target.value);
            index = parseInt(e.target.index);
            filter.gain.setValueAtTime(gain,audioCtx.currentTime);
            valueLabel.innerHTML = gain;

            log('setting beq ' + index + " to " + gain);
            equalizer_biquad_vals_changed();
        });

        var qvLabel = document.createElement("span");
        qvLabel.innerHTML = filter.Q.value;

        var qslider = document.createElement("input");
        qslider.type = 'range';
        qslider.value = filter.Q.value;
        qslider.min = 0;
        qslider.max = 10;
        qslider.index = index;
        qslider.addEventListener("input",(e) =>
        {
            bw = parseFloat(e.target.value);
            index = parseInt(e.target.index);
            filter.Q.setValueAtTime(bw,audioCtx.currentTime);
            qvLabel.innerHTML = bw;
            equalizer_biquad_vals_changed();
        });

        var li = document.createElement("div");
        li.appendChild(label);
        li.appendChild(control);
        li.appendChild(valueLabel);
        li.appendChild(qslider);
        li.appendChild(qvLabel)

        beqContainer.appendChild(li);
    });

    return biquadFilters;
}


function aggregate_frequency_response(filters, frequency_list){
    frequency_list = frequency_list || SIXTEEN_BAND_FREQUENCY_RANGE;
    
    var aggregateAmps = Array(frequency_list.length).fill(0);
    
    

    for(let i in filters){
        filter = filters[i];
        var amp_response = new Float32Array(frequency_list.length);
        var phase_shift = new Float32Array(frequency_list.length);
        filter.getFrequencyResponse(frequency_list,amp_response,phase_shift);
        amp_response.forEach((val,i)=>{
            aggregateAmps[i] += Math.log10(val) * 20;
        })
    }
    return aggregateAmps;
}

// function test(){
//     //const SIXTEEN_BAND_FREQUENCY_RANGE = [20,50,100,156,220,311,440,622,880,1250,1750,2500,3500,5000,10000,20000];

//     let gains = Array(2).fill(0);
//     let qs = Array(2).fill(1);
//     let hz = [1250, 2500];
//     var biquads = biquad_filter_list(hz, gains, qs);
//     console.log(biquads);
// }
// test();
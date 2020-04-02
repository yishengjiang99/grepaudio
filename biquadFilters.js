var biquadFilters; 
function biquad_filter_list(freq_bands,gain_factors, bandwidths, beqContainer)
{
    biquadFilters = [];

    for( let index in freq_bands){
        var filter = audioCtx.createBiquadFilter();
        var freq = freq_bands[index];
        var gain = gain_factors[index];
        var q = bandwidths[index];

        filter.type = index === 0 ? "highpass" : index === num_nodex - 1 ? "lowpass" : "peaking";

        filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
        filter.gain.setValueAtTime(gain,      audioCtx.currentTime);
        filter.Q.setValueAtTime(q, audioCtx.currentTime);
        biquadFilters.push(filter);

    }
    beqContainer.innerHTML = "";

    beqContainer !== null && biquadFilters.forEach((filter,index) =>
    {
        var freq = freq_bands[index];
        var row=`<tr>
        <td><span>${freq} Hz</span></td>
        <td><input id='g_input_${index}' value='${filter.gain.value}' onchange='updateGain()'  data-index="${index}" type="range" min="0" max="60" step="0.1"></td>
        <td><span id='gain_val_${index}'>${filter.gain.value}</span></td>
        <td><input value='${filter.Q.value}'  onchange='updateRange()' data-index="${index}" type="range" min="0" max="60" step="0.1"></td>
        <td><span id='qval_${index}'>${filter.Q.value}</span></td>
        <td><meter id='freq_resp_meter_${index}' type="range" min="0" max="60" step="0.1"></td>
        </tr>`

        beqContainer.innerHTML += row;
    });

    return biquadFilters;
}

function updateGain(e){
   var index = parseInt( event.target.dataset.index );
   document.getElementById(`gain_val_${index}`).innerHTML = event.target.value;
   biquadFilters[index].gain.setValueAtTime(event.target.value, audioCtx.currentTime);
   update_eq_ui();
}

function updateRange(e){
    var index = parseInt( event.target.dataset.index  );
    document.getElementById(`qval_${index}`).innerHTML = event.target.value;

    biquadFilters[index].Q.setValueAtTime(event.target.value, audioCtx.currentTime);
    update_eq_ui();
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
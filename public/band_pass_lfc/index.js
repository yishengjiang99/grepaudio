import {Q,HZ_LIST, DEFAULT_PRESET_GAINS} from '../contants.js';

export default function loadBandPassFilters(ctx, containerId){
    return new Promise( (resolve, reject)=>{
        ctx.audioWorklet.addModule('../band_pass_lfc/processor.js').then(_=>{
            var r = new AudioWorkletNode(ctx, 'band_pass_lfc_processor');
            r.port.onmessage = e => {
                log("msg: "+e.data.msg);
                if(e.data.gainupdates_processed){
                    var inputs =document.querySelectorAll(".bandpass");
                    e.data.gainupdates_processed.forEach((gain,index)=>{
                        inputs[index].value = gain;
                    })
                }
                if(e.data.spl_in){
                 $("#rx0").innerHTML = e.data.spl_in;
                }

                if(e.data.spl_out){
                    
                    $("#rx1").innerHTML = e.data.spl_out;
                   }
            }
            r.port.onmessageerror = e =>{
                log("msg error "+e.message);
            }
    

            let container = $("#"+containerId);
            if(container){
                var r
                HZ_LIST.forEach((hz,index)=>{
					var gain = DEFAULT_PRESET_GAINS[hz+""];

                    var input = document.createElement("input");
					input.type='range';
                    input.className='bandpass'
                    input.min = "-12";
                    input.max = "12";
                    input.value = ""+gain;
                    input.id = "bpi_"+index;
                    input.step="0.1"
					input.oninput = (evt)=>{
						r.port.postMessage({
							gainUpdate: {index: index, value: evt.target.value}
						})
                    }
                    var label = document.createElement("span");
                    
                    label.innerHTML =gain;
                    label.style.position="absolute";
                    label.style.right="1em";
                    label.style.color="blue";
                    input.onchange = (evt)=>label.innerHTML=evt.target.value;
                    var contain = document.createElement("div");
                    contain.style.position='relative';
                    contain.append(input);
                    contain.append(label);
                    contain.id = "bp_"+index;
                    container.append(contain);
                            
                })
            }
            resolve(r)
        }).catch(e=>{
			reject(e);
		})
    })


}

import {Q,HZ_LIST, DEFAULT_PRESET_GAINS} from '../contants.js';

export default function loadBandPassFilters(ctx, containerId){
    return new Promise( (resolve, reject)=>{
        ctx.audioWorklet.addModule('../band_pass_lfc/processor.js').then(_=>{
            var r = new AudioWorkletNode(ctx, 'band_pass_lfc_processor');
            r.port.onmessage = e => {
                log("msg: "+e.data.msg);
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
		
                    input.min = "-12";
                    input.max = "12";
                    input.value = gain;
                    input.id = "bp_"+index;
					input.oninput = (evt)=>{
						r.port.postMessage({
							gainUpdate: {index: index, value: evt.target.value}
						})
					}
					container.append(input);
                })
            }
            resolve(r)
        }).catch(e=>{
			reject(e);
		})
    })


}

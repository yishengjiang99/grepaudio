function DynamicCompressionModule(audioCtx)
{
    var ctx = audioCtx;
    var compressors =[];

    var attributes =[
         ['threshold', -24, -100, 0],
         ['knee', 30, 0, 40],
         ['ratio', 12, 1, 20],
        ['attack', 0.03, 0, 1],
        ['release', 12, 1, 20]];

  
    function addDefaults(n){
        for(let i = 0; i<n; i++) compressors.push(ctx.createDynamicsCompressor());
 

    }
    function getAttributeValue(cp, attrname){
        switch(attrname){
            case "threshold": return cp.threshold;
            case "knee": return cp.knee;
            case "ratio": return cp.ratio; 
            case "attack": return cp.attack; // cp.attack.setValueAtTime(val, audioCtx.currentTime); break;
            case "release": return cp.release;
            default: return null;
        }
    }
    var attach_form = function(container){

        var form = document.createElement("form");

        var table ="<table><tr><td></td><td>threshold</td><td>knee</td><td>ratio</td><td>Attack</td><td>release<td></tr>";

        compressors.forEach( (compressor, index) =>{
            var row =`<tr><td><label>${compressor && compressor.threshold.value || "off"}</label></td>`;

            attributes.forEach( attr=> {
                var name = attr[0];
                var value = compressors[index] !== null && getAttributeValue(compressor, name).value; 
                var val = value !== null ? parseInt(value*100)/100 :  "inactive";
                var inputType = name=='threshold' ? "range" : "numeric";
                row += `<td><input size=3 ${val === null ? "inactive" :""} name='${name}' step="0.1"  tag="${index}" 
                type='${inputType}' value='${val}' placeholder='${name}' max='${attr[3]}' min='${attr[2]}' /> </td>`
               
            });
            row += "</tr>";
            table += row;
        })
        table += "</table>";


        form.innerHTML = table;

        container.appendChild(form);

        form.oninput = e =>{
            log("on change");
            var attrname = e.target.getAttribute("name");
            var index = parseInt(e.target.getAttribute("tag"));
            if( compressors[index] === null)  compressors[index] = ctx.createDynamicsCompressor();
            var cp = compressors[index];
            var val = e.target.value;

            switch(attrname){
                case "threshold": cp.threshold.setValueAtTime(val, audioCtx.currentTime); 
                    e.target.parentElement.previousElementSibling.querySelector("label").innerText = e.target.value;
                    break; 
                case "knee": cp.knee.setValueAtTime(val, audioCtx.currentTime); break;
                case "ratio": cp.ratio.setValueAtTime(val, audioCtx.currentTime); break;
                case "attack": cp.attack.setValueAtTime(val, audioCtx.currentTime); break;
                case "release": cp.release.setValueAtTime(val, audioCtx.currentTime); break;
                default: throw new Error("Unknown prop "+attrname);
             }

        }
    }



    function addCompressor(threshold,knee,ratio,attack,release)
    {
        var compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(threshold,audioCtx.currentTime);
        compressor.knee.setValueAtTime(knee,audioCtx.currentTime);
        compressor.ratio.setValueAtTime(ratio,audioCtx.currentTime);
        compressor.attack.setValueAtTime(attack,audioCtx.currentTime);
        compressor.release.setValueAtTime(release,audioCtx.currentTime);
        compressors.push(compressor);
    }

    function list_connect(next)
    {
        for (let i = 0; i < compressors.length - 1; i++) {
            compressors[i].connect(compressors[i + 1]);
        }
        compressors[i - 1].connect(next);

    }


    return {
        header: compressors[0] || null,
        tail: compressors.length > 0 ? compressors[compressors.length - 1] : null,
        list: compressors,
        addCompressor,
        attach_form,
        list_connect,
        addDefaults,
        getAttributeValue
    }
}

export default DynamicCompressionModule;



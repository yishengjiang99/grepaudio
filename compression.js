function DynamicCompressionModule(audioCtx)
{
    var ctx = audioCtx;
    var compressors = [null, null,null];

    var attributes =[
        ['attack', 0.03, 0, 1],
        ['knee', 30, 0, 40], //db
        ['ratio', 12, 1, 20],
        ['release', 12, 1, 20],
        ['threshold', .25, 0, 1]
    ]

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

        var table ="<table><tr><td></td><td>threshold</td><td>knee</td><td>ratio</td><td>release<td></tr>";


        compressors.forEach( (compressor, index) =>{
            var row =`<tr><td>${index}</td>`
            attributes.forEach( attr=> {
                var name = attr[0];
                var val = compressors[index] !== null && getAttributeValue(compressor, attrname) || attr[1];
                row += `<td><input 
                step="0.1" 
                tag="${index}" 
                type='range' val='${val}' placeholder='${name}' max='${attr[3]}' min='${attr[2]}' /> </td>`
            });
            row += "</tr>";
            table += row;
           

        })
        table += "</table>";


        container.innerHTML = table;

        document.onload = function(){
            form.querySelector("input").addEventListener("change",e=>{
                var attrname = e.target.getAttribute("name");
                var index = parseInt(e.target.getAttribute("tag"));
                var cp = compressors[index];
                var val = e.target.value;
                switch(attrname){
                    case "threshold": cp.threshold.setValueAtTime(val, audioCtx.currentTime); break;
                    case "knee": cp.knee.setValueAtTime(val, audioCtx.currentTime); break;
                    case "ratio": cp.ratio.setValueAtTime(val, audioCtx.currentTime); break;
                    case "attack": cp.attack.setValueAtTime(val, audioCtx.currentTime); break;
                    case "release": cp.release.setValueAtTime(val, audioCtx.currentTime); break;
                    default: throw new Error("Unknown prop");
                }
            })
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
        list_connect
    }
}

export default DynamicCompressionModule;
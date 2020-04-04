
var grepaudio = grepaudio || {};

var ctx, buffer, source;




const read_url=function (url,params){
    params = params || {};
    
    return new Promise((resolve,reject) =>{
        const container = params.elementId  && document.getElementById(params.elementId);
        ctx = params.audioCtx; 
       
        source = params.source || ctx.createBufferSource();

        const playback = params.playback === true;

        let xhr = new XMLHttpRequest();
        xhr.open("GET",url,true);
        xhr.responseType = 'arraybuffer';
        log("load start")
        xhr.onload = function(){
            log("loaded");
            var audioData = xhr.response;
            try{
                ctx.decodeAudioData(audioData, function(buffer_){
        
                    buffer = buffer_;
                    source.buffer = buffer;
                    
                    if(!playback) {
                        resolve(source);
                        return;
                    }
                    source.loop = true;
                    source.connect(ctx.destination);
                    source.start(parseInt(params.start) || 0);

                });
            }catch(e){
                reject(e);
            }
        }
        xhr.onerror = function(e){
            reject(e);
        }
        xhr.onloadstart = function(e){
            log("load strt"+ctx.currentTime);
        }
        xhr.onprogress = (e)=>{
            log("prog "+Math.round(e.loaded*100/e.total,3)+"%")
        }
        xhr.send();
    });
}

const playback_from_url = (url,params) => read_url(url,params.merge({playback:true}));
 
const context_monitor = (interval, cb)=>{
    setTimeout(function(){
        var t1 =  ctx.getOutputTimestamp();
        let info ={
            baseLatency: ctx.baseLatency,
            contextTime: t1.contextTime,
            performanceTime: t1.performanceTime,
            source: source 
        }
        cb(info);
        context_monitor(interval, cb);
    },interval);
}

const load_via_tag = (url, containerId,ctx_)=>{
    return new Promise((resolve,reject)=>{

        var tag = new Audio();
        tag.controls=true;
        tag.autoplay=false;
        ctx =ctx_;

        document.getElementById(containerId).appendChild(tag);
        tag.src=url;
        var node=  ctx.createAnalyser();
        document.body.appendChild(tag);

        window.addEventListener("load",function(e){
            
            source = ctx.createMediaElementSource(tag);
            source.connect(node);
            node.connect(ctx.destination)
            resolve(node);
        })
       
    })
};

const get_filter_db_response = (filter) =>{
    
}


export default {
    read_url,
    playback_from_url,
    context_monitor,
    load_via_tag,
    get_filter_db_response,

}
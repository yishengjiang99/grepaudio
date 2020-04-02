
var grepaudio = grepaudio || {};

const read_url=function (url,params){
    params = params || {};
    
    return new Promise((resolve,reject) =>{
        const container = params.elementId  && document.getElementById(params.elementId);
        let ctx = params.audioCtx;
        let source = ctx.createBufferSource();
        const playback = params.playback === true;

        let xhr = new XMLHttpRequest();
        xhr.open("GET",url,true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(){
            var audioData = xhr.response;
            try{

                ctx.decodeAudioData(audioData, function(buffer){
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
        xhr.send();
    });
}

const playback_from_url = (url,params) => read_url(url,params.merge({playback:true}));
 
export default {
    read_url,
    playback_from_url
}
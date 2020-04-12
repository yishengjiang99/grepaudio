
GainNode.prototype.toString = function(){
  return this.numberOfInputs();
}





const loadURLTo = function (url, output){
  var source = output.context.createBufferSource()
  const xhr = new XMLHttpRequest();

  function loadURL(){
    xhr.open("get", url,true);
    xhr.responseType='arraybuffer';
    source.connect(output);
    var counter = 0;
    xhr.onload= function(evt){
      counter++;
      log('loading '+url+ ' cpounter '+counter)
      output.context.decodeAudioData(xhr.response, function(processed){
          source.buffer = processed;
          counter --;
      });
      source.autoplay=true;
    }
    xhr.onloadend = function(evt){
      if(source.queue.length){
        var next = source.queue.unshift();
        loadURL(next);
      }
    }
    xhr.send();
  }

  return source;
}

export default async function(ctx,containerId) {
  var inputs = [null,null,null,null,null];
  var channelQueues = [[],[],[],[],[]];
  var ctx = ctx;
  var masterGain = ctx.createGain(1);
  var controls = [ctx.createGain(1), ctx.createGain(1), ctx.createGain(1), ctx.createGain(1), ctx.createGain(1)];

  const loadURLTo = function (url, output){
    var source =  ctx.createBufferSource();



    function loadURL(url){
      const xhr = new XMLHttpRequest();
      xhr.open("get", url,true);
      xhr.responseType='arraybuffer';
      source.connect(output);
      var counter = 0;
      xhr.onload= function(evt){
        counter++;
        log('loading '+url+ ' cpounter '+counter)
        output.context.decodeAudioData(xhr.response, function(processed){
            source.buffer = processed;
            counter --;
        });
        source.autoplay=true;
      }
      xhr.onloadend = function(evt){
        if(source.queue.length){
          var next = source.queue.unshift();
          loadURL(next);
        }
      }
      xhr.send();
    }

    return source;
  }


  for( const c of controls){
    c.connect(masterGain)
  }

  const add_from_URL = function(url, index){
    if( inputs[index] !== null ){
      channelQueues[index].push(url);
    }else{

      inputs[index] = loadURLTo(url, controls[index]);
    }

  };

  const add_audio_tag = function(tagId){
       let i = 0; while(i<5 && inputs[i]!==null) {i++ };
       inputs[i] = bindAudioTag(tagId, controls[i]);
     };

 const play = function (i){
  if( inputs[i] === null) return false;
  inputs[i] instanceof MediaElementAudioSourceNode ?  inputs[i].mediaElement.play() : inputs[i].start();
}

const pauseAll = function(){
    inputs.forEach( input=> input !== null & input.pause());;
}
const playAll =  function(){
  inputs.forEach((_,i)=> play(i) );
}
var outputNode = masterGain;

function connect(node) {this.masterGain.connect(node)};



var container = document.getElementById(containerId);

['notes.csv', 'drum.csv', 'songs.csv'].forEach( async (indexfile, index)=>{
  const song_db=await fetch("./samples/"+indexfile).then(res=>res.text()).then(text=>text.split(/(\s+)/));


  var form = document.createElement("form");
  var select = document.createElement("select");
  select.setAttribute("tabindex", index);
  select.innerHTML = song_db.filter(t=>t.trim()!=="").map(t=>"samples/"+t.trim()).map(n => `<option value=${n}>${n.replace('samples/','')}</option>`).join("");
  form.onsubmit = e => {
    e.preventDefault();
    return false;
  }
  form.addEventListener("input|submit|change|click", function(e){
    e.preventDefault();
    add_from_URL(select.value, index);
    return true;
  });
  var apply = document.createElement("input")
  apply.type='submit';
  form.appendChild(select)
  form.appendChild(apply);
  container.appendChild(form);

})

var playBtn = document.createElement("button");
playBtn.innerText='Play'
playBtn.onClick = function(){
  playAll();
}
var pauseBtn = document.createElement("button");
pauseBtn.onclick = function(){
  pauseAll();
}
pauseBtn.innerHTML = 'pause'

var nowPlayingLabel = document.createElement("label");
nowPlayingLabel.text="";
container.append(nowPlayingLabel)
container.append(playBtn)
container.append(pauseBtn)



return {
   inputs, outputNode, controls,
   connect,
   add_audio_tag, playAll, add_from_URL,
   pauseAll, connect
  }
}


GainNode.prototype.toString = function(){
  return this.numberOfInputs();
}

const bindAudioTag = function(tagId, output){
  const myAudio = document.querySelector('audio#'+tagId);
  if(!myAudio) return false;
  const source = output.context.createMediaElementSource(myAudio);
  return source;
}

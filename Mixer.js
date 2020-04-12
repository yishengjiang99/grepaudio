export default async function(ctx,containerId) {
  var inputs = [null,null,null,null,null];
  var channelQueues = [[],[],[],[],[]];
  var ctx = ctx;
  var masterGain = ctx.createGain(1);
  var controls = [ctx.createGain(1), ctx.createGain(1), ctx.createGain(1), ctx.createGain(1), ctx.createGain(1)];


  const loadURLTo = function (url, index){
    var source =  ctx.createBufferSource();

    function loadURL(url){
      const xhr = new XMLHttpRequest();
      xhr.open("get", url,true);
      xhr.responseType='arraybuffer';
      var counter = 0;
    
      xhr.onload= function(evt){
        counter++;
        log('loading '+url+ ' cpounter '+counter)
        ctx.decodeAudioData(xhr.response, function(processed){
            source.buffer = processed;
            source.connect(controls[index]);
            counter --;
            source.start();
          });
        source.autoplay=true;
      }
      xhr.onloadend = function(evt){
        if(channelQueues[index].length){
          var next = source.queue.unshift();
          loadURL(next);
        }else{
          source.onended=function(evttt){
            con.log('gc self'); 
              inputs[index] = null;;
          }
          inputs[index] = null;
        }
      }
      xhr.send();
    }
 
    loadURL(url);
    return source;
  }


  for( const c of controls){
    c.connect(masterGain)
  }

  const add_from_URL = function(url, index){
    if( inputs[index] !== null ){
      channelQueues[index].push(url);
    }else{

      inputs[index] = loadURLTo(url,index);
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
    inputs.forEach( input=>  {
      input !== nul;
      input.stop();
      inputs[i]=null; 
   });
}
const playAll =  function(){
  inputs.forEach((_,i)=> play(i) );
}
var outputNode = masterGain;

function connect(node) {this.masterGain.connect(node)};
var container = document.getElementById(containerId);

['notes.csv', 'drum.csv', 'songs.csv'].forEach( async (indexfile, index)=>{
  const song_db=await fetch("./samples/"+indexfile).then(res=>res.text()).then(text=>text.split(/(\s+)/));


  var select = document.createElement("select");
  select.setAttribute("tabindex", index);
  select.innerHTML = song_db.filter(t=>t.trim()!=="").map(t=>"samples/"+t.trim()).map(n => `<option value=${n}>${n.replace('samples/','')}</option>`).join("");
  var apply = document.createElement("button")
  apply.innerHTML="go";
  container.appendChild(select)
  container.appendChild(apply); 

  apply.onclick = e => {
     add_from_URL(select.value, index);
    e.preventDefault();
    return false;
  }
 

  select.addEventListener("input|submit|change|click", function(e){
    e.preventDefault();
    add_from_URL(select.value, index);
    return false;
  });
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

const bindAudioTag = function(tagId, output){
  const myAudio = document.querySelector('audio#'+tagId);
  if(!myAudio) return false;
  const source = output.context.createMediaElementSource(myAudio);
  return source;
}

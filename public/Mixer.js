
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
          var next = source.queue.shift();
          loadURL(next);
        }else{
          source.onended=function(evttt){
            con.log('gc self');
              inputs[index] = null;;
          }
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
      input.stop();
      //inputs[i]=null;
   });
}
const playAll =  function(){
  inputs.forEach((_,i)=> play(i) );
}
var outputNode = masterGain;

function connect(node) {this.masterGain.connect(node)};
var container = document.getElementById(containerId);

['YT_SEARCH', 'notes.csv', 'drums.csv', 'songs.csv'].forEach( async (indexfile, index)=>{

if(indexfile=='YT_SEARCH'){
  var select = document.getElementById("ytsearch"); 
}else{
  const song_db=await fetch("./samples/"+indexfile).then(res=>res.text()).then(text=>text.split("\n"));
  var select = document.createElement("select");
  select.setAttribute("tabindex", index);
  select.innerHTML = song_db.filter(t=>t.trim()!=="").map(t=>"samples/"+t.trim()).map(n => {
    var url = n.split(",")[0];
    var name = (n.split(",")[1] || url).split("/").pop();
     return `<option value='${encodeURIComponent(url)}'>${name}</option>`
  });
}

  var apply = document.createElement("button")
  apply.innerHTML="go";
  var nowPlayingLabel = document.createElement("label");

  var stop = document.createElement("button")
  stop.innerHTML="stop";
  container.appendChild(select)
  container.appendChild(apply);
  container.appendChild(stop);
  container.appendChild(nowPlayingLabel.wrap("p"));
  stop.onclick = (e)=>{
    inputs[index] instanceof MediaElementAudioSourceNode ?  inputs[index].mediaElement.pause() : inputs[index].stop();
  }

  
  function loadURL(){
    var url = select.value;
    if(select.getAttribute("data-host")){
      url = select.getAttribute("data-host").replace("::QUERY::", select.value);
    }
    nowPlayingLabel.innerHTML="Loading.."+url;
    add_from_URL(url, index);
    return false;
  }

  apply.onclick = loadURL;
  select.addEventListener("input|submit|change|click",loadURL);
  


})

var playBtn = document.createElement("button");
playBtn.innerText='Play'
playBtn.onClick = function(){
  playAll();
}
var pauseBtn = document.createElement("button");
pauseBtn.onclick = function(){
  inputs[index].stop();
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

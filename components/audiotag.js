var audioTag= function(containerId) {
    
    var container = document.querySelector(containerId);

    var audio = document.createElement("audio");
  
    var select = document.createElement("select");
    select.style="height:50px; vertical-align:top;"

    fetch("/samples/mp3list.csv").then(resp => {
        return resp.text();
      }).then(text => {
        container.appendChild(select);
        var filelist = text.split(",");
        select.innerHTML = filelist.map(t => `<option value=${t}>${t}</option>`).join("");
        audio.src = filelist[0];
        select.addEventListener('input', function(e){
            audio.src = e.target.value; 
            audio.loop=true;
            audio.oncanplay = audio.play();
        });
        audio.setAttribute("data-filelist", filelist);
      }).catch(console.error);
      
    return audio;
}

export default audioTag;
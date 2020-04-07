window.requestAnimFrame = (function ()
{
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback,element)
        {
            window.setTimeout(callback,1000 / 60);
        };
})();
window.AudioContext = (function ()
{
    return window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();


window.onerror = function (msg,url,lineNo,columnNo,error)
{
    con.log([msg,url,lineNo,columnNo,error].join(', '))

}
window.log = (txt) => con.log(txt);;


window.logErr = function (text)
{
    if (typeof text === 'object') text = JSON.stringify(text,null,'\n');
    window.log(text);

}



var con = new SimpleConsole({
    placeholder: "",
    id: "console",
    handleCommand: function (command)
    {
        try {
            con.log(window.eq_stdin(command));
        } catch (error) {
            con.log(error);
        }
    },
    autofocus: true, // if the console is to be the primary interface of the page
    storageID: "app-console", // or e.g. "simple-console-#1" or "workspace-1:javascript-console"
});

// add the console to the page
document.body.append(con.element);

window.log = con.log;
window.logErr = con.logError;
// show any uncaught errors (errors may be unrelated to the console usage)
// con.handleUncaughtErrors();
con.element.addEventListener("click", function(){ this.querySelector("input").focus() });

window.initAudioTag= function(containerId) {
    
    var container = document.querySelector(containerId);
    var audio = document.createElement("audio");
    audio.id = 'yt2';
    audio.controls=true;
    audio.autoplay=false;
    var select = document.createElement("select");
    container.appendChild(audio);
    container.innerHTML += "<br>";
    container.appendChild(select);
    fetch("/samples/filelist").then(resp => {
        return resp.text();
      }).then(text => {
        var filelist = text.split("\n");
        select.innerHTML = filelist.map(t => `<option value=${t}>${t}</option>`).join("");
        audio.src = filelist[0];
        select.addEventListener('input', function(e){
            audio.src = e.target.value; 
            audio.oncanplay = audio.play();
        });
        audio.setAttribute("data-filelist", filelist);
      }).catch(console.error);
    return audio;

}
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

const consoleDiv =  document.getElementById("console");
window.log=function(text){
    if(!consoleDiv) console.log(text);
    consoleDiv.innerHTML+="<br>"+text;
    consoleDiv.scrollHeight = consoleDiv.scrollTop;
}
window.logErr=function(e){
    if(!consoleDiv) console.log(text);
    text = "<font color=red>"+text+"</font>";
    consoleDiv.innerHTML+="<br>"+text;
    consoleDiv.scrollHeight = consoleDiv.scrollTop;
}
window.include = function(filename)
{
    var head = document.getElementsByTagName('head')[0];

    var script = document.createElement('script');
    script.src = filename;
    script.type = 'text/javascript';

    head.appendChild(script)
}

grepaudio = {}

grepaudio.getMic = function(audioContext){
    return new Promise((resolve, reject)=>{
        if (navigator.getUserMedia){

            navigator.getUserMedia({audio:true}, 
              function(stream) {
                 resolve(audioContext.createMediaStreamSource(stream));
              },
              function(e) {
               reject(e);
              }
            );
    
        } else {
            reject(new Error("User doesn't have mike."))
        }
    })
}
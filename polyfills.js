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
    else{
        consoleDiv.innerHTML+="<br>"+text;
        consoleDiv.scrollTop = consoleDiv.scrollTop;  
    }
}
window.logErr=function(text){
    if (typeof text === 'object') text = JSON.stringify(text, null,'\n');
    if(!consoleDiv) console.log(text);
    text = "<font color=red>"+text+"</font>";
    window.log(text);

}
window.require_once = function(filename)
{
    return new Promise((resolve,reject)=>{
        var head = document.getElementsByTagName('head')[0];

        var script = document.createElement('script');
        script.src = filename;
        script.async=false 
        script.defer=false
        script.type = 'text/javascript';
    
        head.appendChild(script);
        script.addEventListener("load", resolve);
        script.addEventListener("error", reject);
    })
}


window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1){
      alert('Script Error: See Browser Console for Detail');
    } else {
      var message = [
        'Message: ' + msg,
        'URL: ' + url,
        'Line: ' + lineNo,
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error)
      ].join(' - ');
  
      logErr(message);
    }
  
    return true;
  };
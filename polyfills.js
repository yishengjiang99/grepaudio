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

var con = new SimpleConsole({
	placeholder:"",
    id: "console",
	handleCommand: function(command){
		try {
		    con.log(eval(command));
		} catch(error) {
			con.log(error);
		}
	},
	autofocus: true, // if the console is to be the primary interface of the page
	storageID: "app-console", // or e.g. "simple-console-#1" or "workspace-1:javascript-console"
});


document.body.append(con.element)
window.onerror= function (msg, url, lineNo, columnNo, error) {
  con.log([msg, url, lineNo, columnNo, error].join(', '))


window.log= (txt) => con.log(txt);;


window.logErr=function(text){
    if (typeof text === 'object') text = JSON.stringify(text, null,'\n');
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

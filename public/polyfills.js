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
    placeholder: "",
    id: "console",
    handleCommand: function (command)
    {
        try {
            var resp = index_stdin(command) || eq_stdin(command) || con.log("..");
            con.log(resp)
        } catch (error) {
            con.log(error);
        }
    },
    autofocus: true, // if the console is to be the primary interface of the page
    storageID: "app-console", // or e.g. "simple-console-#1" or "workspace-1:javascript-console"
})
// document.getElementById("console") ? document.getElementById("console").append(con.element) : document.body.append(con.element);

window.con = con;
// add the console to the page

window.log = con.log;
window.logErr = con.logError;
con.element.addEventListener("click",function () { this.querySelector("input").focus() });

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
const $ = (selector) => document.querySelector(selector);
document.onload = function ()
{
    $('.canvas_wrapper')
}
function wrap(el,wrapper)
{
    el.parentNode.insertBefore(wrapper,el);
    wrapper.appendChild(el);
}
HTMLElement.prototype.wrap = function (parent_tag)
{
    let p = document.createElement(parent_tag);
    p.appendChild(this)
    return p;
}

const bigchart_ctx = $("#big-chart") && $("#big-chart").getContext('2d');

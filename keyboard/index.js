/* eslint-disable no-unused-vars */
import { PianoKeyboard } from "./piano.js";
import Envelope from "./envelope.js";

const startBtn = document.querySelector("button#start");
const btn = document.getElementById("playbackBtn");
const debuggerrrr = document.getElementById("console");
const logmsg = (msg) => debuggerrrr.innerHTML+="<br>"+msg; //.appendChild("<br>"+msg+"</br>");
window.onerror = (err)=> console.error(err);




const keyboard = document.createElement("piano-keyboard");
keyboard.addEventListener("trigger", function({note, time, octave}){
  logmsg("trigger");
});
keyboard.addEventListener("release", function({note, time, octave}){

});
keyboard.addEventListener("hold", function({note, time, octave}){

});

startBtn.addEventListener("click", function (event) {
  // Your code to run since DOM is loaded and ready

  const ctx = new AudioContext();
  logmsg("ctx "+ctx.state);
  var ticker = new Worker("./ticker.js");
  console.log(ticker)
  const conductor = new Conductor(ticker);

  btn.onclick = () => conductor.playback();
  window.onmessage = (e) => {
    if (e.data.evt === "triggerAttackRelease") {
      conductor.playback();
    }
  };
},{once:true});



function Conductor(ticker) {
  const BAR_PER_SECOND = 2;
  this.ticker = ticker;
  const n_cols = 50;
  const bpm = 120;
  var trackevents = [];
  var current_page_bitmap = Array(n_cols).fill(Array(12).fill(0));
  var page = 0;
  var start = 0;
  var current_time = 0;
  const time_to_bar = (t) => (bpm * 60) / 1000 / BAR_PER_SECOND;
  var activekeys = {};
  logmsg("starting conductor");

  window.onmessage = function (e) {
    logmsg("window omsg');")
    const { evt, note, time } = e.data;
    if (!time || e.data.relay) return;

    const bitmapRow = e.time % 50;

    if (evt === "trigger") {
      trackevents.push(e.data);
      activekeys[note] = time;
      // current_page_bitmap[ctx.currentTime - ctx.currentTime time_to_bar(time) )]
    } else if (evt === "release") {
      //}.release) {
      trackevents.push(e.data);
      activekeys[note] && delete activekeys[note];
    } else {
      trackevents.push(e.data);
    }
    window.log("track events "+trackevents.length)
    window.postMessage({ ...e.data, relay: 1 });
  };

  //ticker.onload = (e) => ticker.postMessage({ interval: (bpm / 60) * 1000 });
}

Conductor.prototype.playback = function () {
  this.ticker.postMessage("start");
  //and 3 .. 2.. 1?
  const queue = this.trackevents;
  this.ticker.onmessage = function ({ data }) {
    if (data.type === "interval") {
      const now = data.time;

      while (queue.length > 0 && queue[0].time < now + 5) {
        var nextNote = queue[0];
        var note =
          this.piano.adsrs[nextNote.note] || this.piano._getNote(nextNote.note);
        switch (note.eventType) {
          case "trigger":
            console.log("pop event", note);
            note.trigger(now + 0.001);
            break;
          case "hold":
            note.hold(now);
            break;

          case "release":
            note.triggerRelease(now);
            break;
        }
      }
    }
  };
};

export { PianoKeyboard, Envelope };



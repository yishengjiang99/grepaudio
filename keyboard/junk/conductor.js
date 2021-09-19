/* eslint-disable no-undef */
const {PianoKeyboard} = import("./piano.js");

PianoKeyboard.prototype.playSequece = function(track){

  var queue = [];
  track.forEach(event=> queue.push(event));
  const startTime = this.ctx.currentTime;
  function loop(){
    if(queue.length<1) return;
    const now = this.ctx.currentTime;
    const nextNodeTime =  queue[0].time - startTime;
    if(nextNodeTime < now + 0.1){
        const env = this._getNote(next.note);
        queue.pop();
        env.trigger(this.ctx.currentTime);
     }
     requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

}
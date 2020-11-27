let ctx: AudioContext;
export const tickToTime = (t) => t / 1000;
export const parseMidiCSV = (line) => {
    const [instrument, note, _, _2, start, duration] = line.split(",");
    return {
        instrument: instrument
            .replace(" ", "_")
            .replace(" ", "_")
            .replace(" ", "_"),
        note: parseInt(note) - 21,
        start: tickToTime(parseInt(start)),
        duration: tickToTime(parseInt(duration)),
    };
};
//# sourceMappingURL=parseMidi.js.map
const btn = document.createElement("button");
btn.textContent = "start";
const cacheStore = {};
btn.addEventListener("click", async () => {
  ctx = new AudioContext();
  let t0;
  const g = new GainNode(ctx);
  g.connect(ctx.destination);
  const csv = await (await fetch("/db/midi.csv")).text();
  const lines = csv.split("\n");
  for await (const note of (async function* () {
    while (lines.length) {
      const note: MidiNote = parseMidiCSV(lines.shift());
      if (t0 && note.start > ctx.currentTime - t0 + 5.0) {
        await new Promise((resolve) => setTimeout(resolve, 3.0));
      }
      const url = `/db/Fatboy_${note.instrument}/${note.note}.mp3`;
      note.buffer =
        cacheStore[url] ||
        (await fetch(url)
          .then((res) => res.arrayBuffer())
          .then((ab: ArrayBuffer) => ctx.decodeAudioData(ab))
          .catch((e) => alert(e.message + url)));
      cacheStore[url] = cacheStore[url] || note.buffer;
      yield note;
    }
  })()) {
    t0 = t0 || ctx.currentTime;
    const abs = new AudioBufferSourceNode(ctx, { buffer: note.buffer });
    document.body.innerHTML = "starting at " + note.start + t0;
    abs.start(note.start);
    abs.onended=function(){
      this.disconnect();
    }
  }
});
document.body.appendChild(btn);

const file = "song.mid";
fetch("/midi/" + file)
  .then((resp) =>{
	  const reader=resp.body.getReader();
	  reader.read().then(function process(){
		  
	  })
  }
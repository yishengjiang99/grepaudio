export const procURL = URL.createObjectURL(
	new Blob(
		[
			`const frame = 36;
const chunk = 1024;

class PlaybackProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffers = [];
    this.started = false;
    this.port.postMessage("initialized");
    this.port.onmessage = this.handleMesg.bind(this);
    this.rptr = 0;
    this.loss = 0;
    this.total = 0;
    this.rms = 0;
  }
  handleMesg(evt) {
    this.readable = evt.data.readable;
    let reader = this.readable.getReader();
    let that = this;
    reader.read().then(function process({ done, value }) {
      if (done) {
        that.port.postMessage({ done: 1 });
        return;
      }
      let offset = 0;
      value &&
        that.port.postMessage({stats:
          {
            rms: that.rms,
            buffered: (that.buffers.length / 350).toFixed(3),
            lossPercent: ((that.loss / that.total) * 100).toFixed(2)
          }
        });
      while (value.length >= chunk) {
        const b = value.slice(0, chunk);
        that.buffers.push(b);
        value = value.slice(chunk);
      }
      if (that.started === false && that.buffers.length > 10) {
        that.port.postMessage({ ready: 1 });
        that.started = true;
      }
      reader.read().then(process);
    });
  }

  process(inputs, outputs, parameters) {
    if (this.started === false) return true;

    if (this.buffers.length === 0) {
      this.loss++;
      return true;
    }
    this.total++;

    const ob = this.buffers.shift();
    const fl = new Float32Array(ob.buffer);
    let sum = 0;
    for (let i = 0; i < 128; i++) {
      for (let ch = 0; ch < 2; ch++) {
        outputs[0][ch][i] = fl[i * 2 + ch];
        sum += fl[i * 2 + ch] * fl[i * 2 + ch];
      }
    }
    this.rms = Math.sqrt(sum / 256);
    return true;
  }
}
registerProcessor("playback-processor", PlaybackProcessor);
`,
		],
		{ type: "application/javascript" }
	)
);

import EventEmitter from './EventEmitter.js';
import { LitElement, html } from './node_modules/lit-element/lit-element.js'
AudioParam.prototype.request_value_change_UI_thread = function (newValue) {
  this.cancelScheduledValues(context.currentTime)
  this.setValueAtTime(newValue, context.currentTime + context.baseLatency);
}
const margin_left = 15;
const margin_top = 15;
const noctaves = 11;

class DrawEQ extends LitElement {
  static get properties() {
    return {
      ctx: { type: AudioContext },
      biquadFilters: { type: Array(BiquadFilterNode) },
      dbScale: { type: Number },
      filterIndexInFocus: { type: Number }
    };
  }
  handleEvent(e) {
    console.log(e)
  }
  constructor(){
    super();
    this.render_frequency_response.bind(this)
    
  }
  bind(ctx, biquadFilters) {

    this.canvas = this.shadowRoot.querySelector('#geq .layer0');
    this.histogram = this.shadowRoot.querySelector('#geq .layer2');
    this.static_marks = this.shadowRoot.querySelector('#geq .layer1');
    this.width_plus_margins = this.parentElement.clientWidth;
    this.height_plus_margins = this.parentElement.clientHeight;
    this.canvas.setAttribute('width', this.width_plus_margins);
    this.canvas.setAttribute('height', this.height_plus_margins);
    this.histogram.setAttribute('width', this.width_plus_margins);
    this.histogram.setAttribute('height', this.height_plus_margins);
    this.static_marks.setAttribute('width', this.width_plus_margins);
    this.static_marks.setAttribute('height', this.height_plus_margins);
    this.width = this.width_plus_margins-2*margin_left;
    this.height = this.height_plus_margins -2 * margin_top;
    this.zoomescale = 1;
    this.ctx = 12;
    this.pixelsPerDb =  (0.5 * this.height) / this.dbScale;
    this.nyquist = ctx.sampleRate / 2
    this.dbScale = 32;
    this.filterIndexInFocus = -1;
    this.dbToY=(db)=> {
      debugger;
      return ((0.5 * this.height) - this.pixelsPerDb * db) * this.zoomscale + this.shiftup;
    };

    this.yToDb = (y) =>(this.height - (y - this.shiftup) / this.canvas_zoomscale) /this.pixelsPerDb;
    console.log("got cts")
    this.render_static_layer();
    this.filters = biquadFilters;
    this.vtx = this.canvas.getContext('2d');

    this.shiftup = 0;

    this.render_frequency_response();
//
  }




  render_static_layer() {
    
    let height = this.height;
    let width = this.width;
    let dbScale = this.dbScale
    let vtx = this.shadowRoot.querySelector('#geq .layer1').getContext("2d");
    vtx.clearRect(0,0, this.width_plus_margins,this.height.plus_margins);
    vtx.fillStyle = "rgb(1,11,11)";

    vtx.fillRect(0, 0, this.width + 2 * margin_left, this.height + 2 * margin_top);

    // Draw frequency scale.
    var curveColor = "rgb(192,192,192)";
    var curveColorSubbands = "rgb(192,192,192,0.4)";
    var playheadColor = "rgb(80, 100, 80)";
    var gridColor = "rgb(100,100,100)";
    // Draw 0dB line.
    vtx.lineWidth=2;
    vtx.strokeStyle=gridColor;
    vtx.beginPath();
    vtx.moveTo(0, 0.5 * height);
    vtx.lineTo(width, 0.5 * height);
    vtx.stroke();
    var shiftup = 0;

    
    for (var octave = 1; octave <= noctaves; octave++) {
      var x = octave * width / noctaves + margin_left;
      vtx.strokeStyle = gridColor;
      vtx.moveTo(x, 30);
      vtx.lineTo(x, this.height);
      vtx.stroke();
      var f = this.ctx.sampleRate / 2 * Math.pow(2.0, octave - noctaves);
      vtx.textAlign = "center";
      vtx.strokeStyle = curveColor;
      vtx.strokeText(f.toFixed(0) + "Hz", x, 20);
    }
    const canvasContext = vtx;
    for (var db = -dbScale; db < dbScale; db += 5) {  

      var y = this.dbToY(db);
      console.log(db + "mappped to "+y);
      canvasContext.strokeStyle = curveColor;
      canvasContext.strokeText(db.toFixed(0) - 35 + "dB", this.width - 40, y);
      canvasContext.strokeStyle = gridColor;
      canvasContext.beginPath();
      canvasContext.moveTo(0, y);
      canvasContext.lineTo(width, y);
      canvasContext.stroke();
    }


  }

  render_frequency_response() {
    var freqs  =this.calcNyquists(this.width);
    var cc = ['blue', 'red', 'green'];
    const knobcolors = ['blue', 'red', 'green', 'white', 'grey'];

    var magResponse = new Float32Array(freqs.length);
    var phaseResponse = new Float32Array(freqs.length);
    var aggregate = new Float32Array(freqs.length).fill(0);
    var knobRadius = 5;
    const vtx =  this.canvas.getContext('2d');
    vtx.strokeWidth = '1px';
    //  vtx.clearRect(0,0,width,this.height)
    let dbToY = this.dbToY;
    var centerFreqXMap = {};
    var centerFreqKnobs = [];
   for (let i in this.filters) {
      const filter = this.filters[i]
      vtx.beginPath();
      vtx.moveTo(0, this.height);

      if (centerFreqKnobs[i] === null ||this.dirty == true) {
        filter.getFrequencyResponse(freqs, magResponse, phaseResponse);
        for (var k = 0; k < width; ++k) {
          db = 20.0 * Math.log(magResponse[k]) / Math.LN10;
          var phaseDeg = 180 / Math.PI * phaseResponse[k];
          var realdb = db;//db * Math.cos(phaseDeg);
          aggregate[k] += realdb;
          let y = dbToY(realdb)
          vtx.lineTo(k, y);
          if (k > 0 && freqs[k] > filter.frequency.value && freqs[k - 1] < filter.frequency.value) {
            var color = knobcolors[k % 3];
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(k, y, 10, 0, 2 * Math.PI, false);
            ctx.fill();
            centerFreqKnobs[i] = [k, y];
            centerFreqXMap[i] = i;
          }
        }
      }
      vtx.lineTo(this.width, this.height);
      vtx.lineTo(0, this.height)
      vtx.stroke();
      if (i == this.filterIndexInFocus) {
        vtx.fillStyle = `rgb(211,211,211,0.1)`;
        vtx.fill();
      } else {
        vtx.fillStyle = `rgb(111,111,111,0.05)`;
        vtx.fill();
      }
    }
//
    vtx.beginPath();
    vtx.strokestyle = '3px';
    vtx.moveTo(0, this.height);
    for (var k = 0; k < this.width; ++k) {
      var y = dbToY(aggregate[k])

      vtx.lineTo(k, y);

    }
    vtx.lineTo(this.width, this.height);
    vtx.moveTo(0, this.height);
    vtx.stroke();
    vtx.closePath();
    vtx.stroke();
    vtx.fillStyle = 'red'
    // vtx.fill();
    this.dirty = false;

  }

  canvas_dbl_click(e) {
    if (this.filterIndexInFocus > -1) {
      filters[this.filterIndexInFocus].gain.setValueAtTime(YToDb(e.offsetY), ctx.currentTime);
     this.dirty = true;
      drawScalesAndFrequencyResponses();
    }
  }
  canvas_onmousemove() {
    if (this.mousedown === true && this.filterIndexInFocus > -1) {
      if (e.movementY * e.movementY > 25) {
        var currentQ = filters[this.filterIndexInFocus].Q.value;
        var targetQ;
        if (e.offSetY > 0) targetQ = currentQ * 1.02;
        else targetQ = currentQ * 0.97;
        filters[this.filterIndexInFocus].gain.setTargetAtTime(YToDb(e.offsetY), ctx.currentTime + 0.001, 0.001);
        filters[this.filterIndexInFocus].Q.setTargetAtTime(targetQ, ctx.currentTime + 0.001, 0.001);
      }
      if (e.movementX * e.movementX > 10) {

        // filters[this.filterIndexInFocus].frequency.request_value_change_UI_thread(xToFreq(e.offsetX));

      }
     this.dirty = true;
      drawFrequencyResponses();
    } else {
      focusClosest(e);
    }
  }
  render() {
    return html`
    <div id='geq' class='wrapper' style="background-color:black; position: relative; display:block; height:900px; height:500px;">
      <canvas class="layer2"  style="position: absolute;left: 0; top: 0; z-index: 2;"></canvas>
      <canvas class="layer1"  style="position: absolute; left: 0; top: 0; z-index: 1;"></canvas>
      <canvas class="layer0"  style="position: absolute; top: 0; z-index: 0;"></canvas>
    </div>`
  }
  calcNyquists() {
    let width = 225;
    var freq = new Float32Array(width);
    for (var k = 0; k < width; ++k) {
      var f = k / width;
      f = Math.pow(2.0, noctaves * (f - 1.0));
      freq[k] = Math.floor(f * this.nyquist);
    }
    window.allfreqs = freq;
    console.log(freq.join(", "));
    return freq;
  }
}
customElements.define('draw-eq', DrawEQ);

export default DrawEQ;

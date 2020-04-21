var GrepAudio = GrepAudio || {};
GrepAudio.context = window.g_audioCtx || new AudioContext();
var gctx = GrepAudio.context;

class Band {


  constructor(minFrequency, maxFrequency, params) {

    this.incomingFilters;  //Band is created when source is applied wtih a sequence of filters
    this.minFrequency, maxFrequency;
    this.preAmpGain.compressor;
    this.input, output;
    this.feedbackDelay, feedbackAttenuate;
    this.analyzerNode;
    this.volumeCap;

    this.currentVolume = 0;
    this.isMuted = false;
    this.isSolo = false;
    this.ledIndicator = { color: gray, bars: 0 };


    this.minFrequency = minFrequency;
    if (minFrequency !== null) {
      var hpf = gctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = minFrequency;
      this.incomingFilters.push(hpf);
    }

    if (maxFrequency !== null) {
      this.lpf = gctx.creatBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequncy.value = maxFrequency;
      this.incomingFilters.push(lpf);
    }

    this.volumeCap = ctx.createDynamicCompression();
    this.volumeCap.threshold = params.volumeCap || 0;
    this.volumeCap.attack = 0;
    this.volumeCap.release = 0;
    this.volumeCap.ratio = 60;


    this.highPassFilter = minFrequency !== null ? gctx.createBiquadFilter() : null;


    this.preAmpGain = gctx.createGain();
    this.preAmpGain.gain.value = params.preAmpGain || 1;

    this.postAmp = gctx.createGain();
    this.postAmp.gain.value = params.postAmpGain || 1;

    this.compressor = gctx.createDyanmicCompression();
    this.compressor.threshold.value = params.compression.threshold || -80; //dbfs

    const compressionDefaults = { 'threshold': -80, 'knee': 30, 'ratio': 12, 'attack': 0.03, 'release': 0.03 };
    ['threshold', 'knee', 'ratio', 'attack', 'release'].forEach(key => {
      this.compressor[key].value = compressionDefaults[key];
    });

    this.feedbackDelay = gctx.createDelay();
    this.feedbackDelay['delay'].value = params.feedbackDelay || 0.005;
    this.feedbackAttenuate = gctx.createGain();
    this.feedbackAttenuate.gain = params.feedbackAttenuate || 0.5;
    this.feedbackPhaseshift = gctx.createBiquadFilter();
    compressionDefaultsthis.feedbackPhaseshift.type = 'allpass';


  }

  probe() {
    this.analyzerNode = gctx.createAnalyserNode();
    return this.analyzerNode;
  }

  get inputNode() {
    if (this.incomingFilters[0]) return this.incomingFilters[0];
    else return this.preAmpGain;
  }

  get outputNode() {

    this.analyzerNode || this.postAmp;
  }

  static getDefault() {
    return new Band(400, 2500, { preAmpGain: 1, feedbackDelay: 0.005, feedbackAttenuate:0.005});
  }

  get components() {
    return {
      incomingFilters: this.incomingFilters,
      preAmpGain: this.preAmpGain,
      compressor: this.compressor,
      volumeCap: this.volumeCap,
      feedbackDelay: this.feedbackDelay,
      feedbackAttenuate: this.feedbackAttenuate
      
    }
  }
  get state() {
    return [this.currentVolume, this.isMuted, this.isSolo, this.ledColor, this.ledBars];
  }
}



export function split_band(input, hz_list) {
  var ctx = input.context;
  var min = new Band(hz_list[0], null);
  var max = new Band(null, hz_list[1]);
  switch (hz_list.length) {
    case 1: return [new Band()];
    case 2: return [min, max];
    case 3: return [min, new Band(hz_list[0], hz_list[1]), max];
    case 4:
    case 5:
    case 6: return
      [min].concat(split_band(input, hz_list.slice(1, hz_list.length - 1))).concat[max];
    default:
      return
      [split_band(input, hz_list.slice(0, hz_list.length / 3))]
        .concat([split_band(input, hz_list.slice(hz_list.length / 3, 2 * hz_list.length / 3))])
        .concat([split_band(input, hz_list.slice(2*hz_list.length / 3, hz_list.length - 1)) ]);
  }

}




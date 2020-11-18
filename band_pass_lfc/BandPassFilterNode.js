import { Q, HZ_LIST, DEFAULT_PRESET_GAINS } from "../constants.js";

export default class BandPassFilterNode extends AudioWorkletNode {
  constructor(ctx, options) {
    super(ctx, "band_pass_lfc_processor", options);
    this._worker = new AudioWorkletNode(ctx, "band_pass_lfc_processor");
    this.port.onmessage = (e) => {
      if (e.data.gainupdates_processed) {
        var inputs = document.querySelectorAll(".bandpass");
        e.data.gainupdates_processed.forEach((gain, index) => {
          inputs[index] && (inputs[index].value = gain);
        });
      }
      if (e.data.spl_in) {
        $("#rx0").innerHTML = "sound in " + e.data.spl_in;
      }

      if (e.data.spl_out) {
        $("#rx1").innerHTML = "volume out" + e.data.spl_out;
      }
    };
    this.port.onmessageerror = (e) => {
      log("msg error " + e.message);
    };
    this.inputs = [];
  }
  setGainAtFreq(gain, freq) {
    var index = HZ_LIST.indexOf(freq);
    if (index < 0) throw new Error("freq " + freq + " not mapped");
    this.postMessage({
      gainUpdate: { index: index, value: gain },
    });
  }

  setGainsProcessed(gainupdates_processed) {
    var index = HZ_LIST.indexOf(freq);
    if (index < 0) throw new Error("freq " + freq + " not mapped");
    this.postMessage({
      gainUpdate: { index: index, value: gain },
    });
  }

  defaultGains() {
    return DEFAULT_PRESET_GAINS;
  }
}

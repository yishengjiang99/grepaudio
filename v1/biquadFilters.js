var BiquadFilters = function (ctx) {
  var biquadFilters = [];
  var audioCtx = ctx;
  var bandpassFilters = [];
  const hz_bands = new Float32Array(
    32,
    64,
    125,
    250,
    500,
    1000,
    2000,
    4000,
    8000,
    16000
  );

  const bars = [
    { label: "32", f: 32, Q: 1, gain: 1, type: "highshelf" },
    { label: "64", f: 64, Q: 1, gain: 1, type: "highshelf" },
    { label: "125", f: 125, Q: 1, gain: 1, type: "highshelf" },
    { label: "250", f: 250, Q: 1, gain: 1, type: "highshelf" },
    { label: "500", f: 500, Q: 1, gain: 1, type: "highshelf" },
    { label: "1000", f: 1000, Q: 1, gain: 1, type: "highshelf" },
    { label: "2k", f: 2000, Q: 1, gain: 1, type: "highshelf" },
    { label: "4k", f: 4000, Q: 1, gain: 1, type: "highshelf" },
    { label: "8k", f: 8000, Q: 1, gain: 1, type: "highshelf" },
    { label: "16k", f: 16000, gain: 1, type: "highshelf" },
  ];
  var highShelf;
  var lowShelf;
  var highPass;
  var lowPass;

  function filter_option_2(context, preamp, postamp) {
    highShelf = context.createBiquadFilter();
    lowShelf = context.createBiquadFilter();
    highPass = context.createBiquadFilter();
    lowPass = context.createBiquadFilter();

    preamp.connect(highShelf);
    highShelf.connect(lowShelf);
    lowShelf.connect(highPass);
    highPass.connect(lowPass);
    lowPass.connect(postamp);

    highShelf.type = "highshelf";
    highShelf.frequency.value = 4700;
    highShelf.gain.value = 50;

    lowShelf.type = "lowshelf";
    lowShelf.frequency.value = 35;
    lowShelf.gain.value = 50;

    highPass.type = "highpass";
    highPass.frequency.value = 800;
    highPass.Q.value = 0.7;

    lowPass.type = "lowpass";
    lowPass.frequency.value = 880;
    lowPass.Q.value = 0.7;

    this.biquadFilters = [highShelf, lowShelf, highPass, lowPass];

    return this.biquadFilters;
  }

  BiquadFilterNode.prototype.toJson = function () {
    var a = new Float32Array(hz_bands.length);
    var b = new Float32Array(hz_bands.length);
    var fr = this.getFrequencyResponse(hz_bands, a, b);
    return {
      gain: this.gain.value,
      frequency: this.frequency.value,
      type: this.type,
      q: this.Q.value,
      FRMag: a,
      FRPhase: b,
    };
  };

  BiquadFilterNode.prototype.toString = function () {
    return JSON.stringify({
      gain: this.gain.value,
      frequency: this.frequency.value,
      type: this.type,
      q: this.Q.value,
    });
  };

  function toJson() {
    return biquadFilters.map((b) => toJson());
  }

  function default_filters() {
    biquadFilters = [];
    bandpassFilters = [];
    bars.forEach((obj, i) => {
      var filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.gain.value = 6;
      filter.Q.value = 5;
      filter.frequency.value = obj.f;
      bandpassFilters.push(filter);

      var highshelf = audioCtx.createBiquadFilter();
      highshelf.type = "highshelf";
      highshelf.gain.value = 1;
      highshelf.Q.value = 1;
      highshelf.frequency.value = obj.f;
      biquadFilters.push(highshelf);
    });
    filter_ui();
    return biquadFilters;
  }

  function filter_ui() {
    var container = document.querySelector("#eq_update_form");
    container.append(document.createDocumentFragment());
    bars.map((obj, i) => {
      var input = document.createElement("input");
      input.type = "range";
      input.labelledby = "IDREF";
      input.setAttribute("data-index", i);
      input.valuetext = input.value;
      switch (obj.type) {
        case "lowshelf":
        case "highshelf":
          input.name = "gain";
          input.value = obj.gain;
          input.max = 12;
          input.min = -12;
          input.ddefaultValue = 0;
          break;
        case "lowpass":
        case "highpass":
          input.name = "Q";
          input.defaultValue = 0.5;
          input.value = obj.q;
          input.min = 0;
          input.max = 12;
          break;
        case "peaking":
          input.min = -12;
          input.max = 12;
          input.defaultValue = 0;
          input.value = obj.q;
          input.value = 0;
          input.name = "Q";

          break;
      }
      var meter = document.createElement("meter");
      meter.min = 0;
      meter.max = 4;
      meter.value = 1;
      meter.className = "freq_resp_meter";
      meter.index = i;

      var label = document.createElement("label");
      label.innerHTML = input.value;

      input.oninput = (e) => {
        var thefilter = biquadFilters[i] || audioCtx.createBiquadFilter();
        var value = e.target.value;
        label.innerHTML = value;
        var name = e.target.name;
        if (name === "gain") {
          thefilter.gain.setValueAtTime(value, audioCtx.currentTime + 0.1);
        } else if (name === "Q") {
          thefilter.Q.setValueAtTime(value, audioCtx.currentTime + 0.1);
        }
        con.logHTML("updated filter " + i + " " + name + " to " + value);
        // post_FR_update();
        var freq_list = new Float32Array(
          biquadFilters.map((b) => b.frequency.value)
        );
        var a = new Float32Array(freq_list.length);
        var b = new Float32Array(freq_list.length);
        // var newfrq = biquadFilters[i].getFrequencyResponse(freq_list,a,b);
        var newfrq = biquadFilters[i].getFrequencyResponse(freq_list, a, b);
        window.post_data("freq_resp_update", a, b);
      };

      var nameLabel = document.createElement("label");
      nameLabel.innerHTML = obj.label;

      nameLabel.style.textAlign = "right";
      var col = document.createElement("tr");
      var bpinput = document.getElementById("bp_" + i);

      col.append(nameLabel.wrap("td"));
      col.append(input.wrap("td"));
      col.append(label.wrap("td"));
      if (bpinput) col.append(bpinput.wrap("td"));
      col.append(meter.wrap("td"));

      container.append(col);
    });
  }

  function get_list(audioCtx, freq_bands, gain_factors, bandwidths) {
    for (let index in freq_bands) {
      var filter = audioCtx.createBiquadFilter();
      var freq = freq_bands[index];
      var gain = gain_factors[index];
      var q = bandwidths[index];

      if (index == 0) filter.type = "highself";
      else if (index == num_nodes - 1) filter.type = "lowshelf";
      else filter.type = "peaking";

      filter.type = "peaking";
      filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
      filter.gain.setValueAtTime(gain, audioCtx.currentTime);
      filter.Q.setValueAtTime(q, audioCtx.currentTime);
      filter.getFrequencyResponse;
      biquadFilters.push(filter);
    }
    return biquadFilters;
  }

  function create(audioCtx, freq, type, gain, q) {
    var filter = audioCtx.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
    filter.gain.setValueAtTime(gain, audioCtx.currentTime);
    filter.Q.setValueAtTime(q, audioCtx.currentTime);
    return filter;
  }
  function post_FR_update() {
    var frps = aggregate_frequency_response(biquadFilters, hz_bands);
    window.post_data("freq_resp_update", frps.amp_response);
  }

  function aggregate_frequency_response(filters, frequency_list) {
    var frequency_list = frequency_list && new Float32Array(frequency_list);
    frequency_list =
      frequency_list ||
      new Float32Array(biquadFilters.map((f) => f.frequency.value));

    var aggregateAmps = Array(frequency_list.length).fill(0);
    var amp_list = [];
    for (let i in filters) {
      var filter = filters[i];
      var amp_response = new Float32Array(frequency_list.length);
      var phase_shift = new Float32Array(frequency_list.length);
      filter.getFrequencyResponse(frequency_list, amp_response, phase_shift);
      amp_response.forEach((val, i) => {
        aggregateAmps[i] += val;
      });
      amp_list.push(amp_response);
    }

    //        con.logHTML(biquadFilters.map( b => dd(b) ).join("<br>"))

    return {
      aggregate: aggregateAmps,
      amp_list: amp_list,
      biquads: biquadFilters,
    };
  }

  function to_string() {
    return this.biquadFilters.map((b) => dd(b)).join("|");
  }

  function createFromString(audioCtx, string) {
    var params = string.split("|");
    var freq = params[0] || 60;
    var gain = params[1] || 5;
    var q = params[2] || 4;
    var type = params[1] || "peaking";
    return create(audio, freq, type, gain, q);
  }

  function dd(filter) {
    const json = filter.toJson();
    return (
      Object.keys(json).map(
        (k) =>
          `${k}</b>: ${
            typeof json[k] == "object" ? json[k].join(",") : json[k]
          }`
      ) + "\n"
    );
  }
  return {
    default_filters,
    toJson: toJson,
    aggregate_frequency_response,
    createFromString,
    create,
    filter_option_2,
    to_string: dd,
  };
};
export default BiquadFilters;

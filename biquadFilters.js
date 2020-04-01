function biquad_filter_list(freq_bands,gain_factors, beqContainer)
{
    var biquadFilters = freq_bands.map((freq,index) =>
    {
        var filter = audioCtx.createBiquadFilter();
        var gain = gain_factors[index];

        filter.type = index === 0 ? "lowshelf" : (index === num_nodex - 1 ? "highshelf" : "peaking");
        filter.frequency.setValueAtTime(freq, audioCtx.currentTime);
        filter.gain.setValueAtTime(gain,      audioCtx.currentTime);
        return filter;
    });

    biquadFilters.forEach((filter,index) =>
    {
        var freq = freq_bands[index];
        var label = document.createElement("label");
        label.innerHTML = freq + " Hz";

        var control = document.createElement("input");
        control.type = "range";
        control.value = filter.gain.value;
        control.min = 0;
        control.max = 20;
        control.index = index;

        var valueLabel = document.createElement("label");
        valueLabel.innerHTML = filter.gain.value;
        control.addEventListener("input",(e) =>
        {
            gain = parseFloat(e.target.value);
            index = parseInt(e.target.index);
            filter.gain.setValueAtTime(gain,audioCtx.currentTime);
            valueLabel.innerHTML = gain;

            log('setting beq ' + index + " to " + gain);
        });

        var qvLabel = document.createElement("label");
        qvLabel.innerHTML = filter.Q.value;

        var qslider = document.createElement("input");
        qslider.type = 'range';
        qslider.value = filter.Q.value;
        qslider.min = 0;
        qslider.max = 10;
        qslider.index = index;
        qslider.addEventListener("input",(e) =>
        {
            bw = parseFloat(e.target.value);
            index = parseInt(e.target.index);
            filter.Q.setValueAtTime(bw,audioCtx.currentTime);
            qvLabel.innerHTML = bw;
        });

        var li = document.createElement("li");
        li.appendChild(label);
        li.appendChild(control);
        li.appendChild(valueLabel);
        li.appendChild(qslider);
        li.appendChild(qvLabel)

        beqContainer.appendChild(li);
    });

    return biquadFilters;
}

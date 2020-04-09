const BQ_ENUM = {
    LPF:    'lowpass', /* low pass filter */
    HPF:    'highpass', /* High pass filter */
    BPF:    'bandpass', /* band pass filter */
    NOTCH:   "notch", /* Notch Filter */
    PEQ:    "peaking", /* Peaking band EQ filter */
    LSH:    "lowshelf", /* Low shelf filter */
    HSH:    "highshelf" /* High shelf filter */
};


var graph = function(path_str,ctx_){
    let ctx = ctx_ ||  new OfflineAudioContext(2,44100*40,44100)
    var cursor;
    var header; 
    let node;
    path_str.split("|").map( pstr=>{ 

        let t = pstr.split(",");
        switch(t[0]){
            case "BQ": 
                node = ctx.createBiquadFilter();
                node.frequency.value = t[2];
                node.type = BQ_ENUM[t[1]];
                if (t[3] && t[3] !='_' ) node.gain.value = parseFloat(t[3]);
                if (t[4] && t[4] !='_' ) node.Q.value = parseFloat(t[4]);
                break;
            case "G": 
                node = ctx.createGain(); 
                node.frequency.value = t[2];
                node.gain.value = t[1];
                break;
            default: break;
    
        }
        if(!cursor) {
            
            cursor = node;
            header = node;
        }else{
            cursor.connect(node);
            cursor = node;
        }
    })
    if(cursor) {
        cursor.connect(node);
        cursor = node;
    }else{
        header = cursor;
    }
    return {
        cursor,header,ctx
    }
}


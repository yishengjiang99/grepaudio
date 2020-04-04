// for cross browser compatibility
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();


var real = new Float32Array(2);
var imag = new Float32Array(2);
const rx1= document.getElementById("rx1")
const rx2= document.getElementById("rx2")

real[0] = 0;
imag[0] = 0;
real[1] = 1;
imag[1] = 0;

var wave = audioCtx.createPeriodicWave(real, imag, {disableNormalization: true});

var sampled_at = [];
var fftSize = 1024;

// var chart = c3.generate({
//     data: {
//         x: 'x',
//         columns: [
//             ['x', 1, 2],
//             ['before', 0, 0],
//             ['affter', 0 ,0]
         
//         ]
//     }
// });


var sweepLength = 5;
var attackTime =  document.getElementById("attack").value;
 document.getElementById("attack").onchange=(e)=> { attack = e.target.value};
var releaseTime =  document.getElementById("release").value;
 document.getElementById("release").onchange=(e)=> { release = e.target.value};


function mike_check(audioCtx, rx){
    var rms_t = [];
    var tt = [];
    var spl_db_a = audioCtx.createScriptProcessor(4096,1,1);

    spl_db_a.onaudioprocess = function(audioProcessingEvent){
   // The input buffer is the song we loaded earlier
      var inputBuffer = audioProcessingEvent.inputBuffer;

      // The output buffer contains the samples that will be modified and played
      var outputBuffer = audioProcessingEvent.outputBuffer;

  // Loop through the output channels (in this case there is only one)
        var sum = 0;
      for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        var inputData = inputBuffer.getChannelData(channel);
        var outputData = outputBuffer.getChannelData(channel);

        // Loop through the 4096 samples
        for (var sample = 0; sample < inputBuffer.length; sample++) {
          // make output equal to the same as the input
          outputData[sample] = inputData[sample];
          sum += inputData[sample];
        
        }
      }

      var t = audioCtx.currentTime;

      var rms = Math.sqrt(sum/inputBuffer.length);
      tt.push(t);
      rms_t.push(rms);
      rx.innerText=rms;

    }
    
    
    return {
        spl_db_a,
        rms_t,tt
    };
}

var sweepLength = 5;
var attackTime =  document.getElementById("attack").value;
 document.getElementById("attack").onchange=(e)=> { attack = e.target.value};
var releaseTime =  document.getElementById("release").value;
 document.getElementById("release").onchange=(e)=> { release = e.target.value};

     let prob1 = mike_check(audioCtx,rx1);
    let prob2 = mike_check(audioCtx,rx2);


function playSweep() {

     let osc = audioCtx.createOscillator();
     osc.setPeriodicWave(wave);
     osc.frequency.value = 120;
     osc.onended=function(e){
         osc.disconnect();

         var report  =  prob1.rms_t.map( (v, i)=>{
            var rr= prob1.tt[i]+", "+v;
            if(prob2.rms_t[i]) rr += ","+ prob2.tt[i] +","+ prob2.rms_t[i];
            return rr;

         }).join("\n<br>")


        document.body.append( report);
        
         prob1.rms_t.disconnect();
         prob2.rms_t.disconnect();
     }


    let sweepEnv = audioCtx.createGain();
    sweepEnv.gain.cancelScheduledValues(audioCtx.currentTime);
    sweepEnv.gain.setValueAtTime(0, audioCtx.currentTime);

    // set our attack
    sweepEnv.gain.linearRampToValueAtTime(5, audioCtx.currentTime + attackTime);
    // set our release
    sweepEnv.gain.linearRampToValueAtTime(10, audioCtx.currentTime + sweepLength - releaseTime);

    osc.connect(prob1.spl_db_a);
    prob1.spl_db_a.connect(sweepEnv);
    
    sweepEnv.connect(prob2.spl_db_a)
    prob2.spl_db_a.connect(audioCtx.destination);
    //osc.connect(sweepEnv).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + sweepLength);

}


const btn = document.createElement("button")
btn.innerText="sweep"
btn.onclick = playSweep;
document.body.appendChild(btn);
function $(s) {
    document.getElementById(s);
}

window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1){
      alert('Script Error: See Browser Console for Detail');
    } else {
      var message = [
        'Message: ' + msg,
        'URL: ' + url,
        'Line: ' + lineNo,
        'Column: ' + columnNo,
        'Error object: ' + JSON.stringify(error)
      ].join(' - ');
  
      console.log(message);
    }
  
    return true;
  };


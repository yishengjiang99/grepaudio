import {line_chart} from './visualize.js'
function io_samplers(ctx, fftSize){
    var _ctx = ctx;
    var sampled_at = [];

    var outputAnalyzer = _ctx.createAnalyser();
    outputAnalyzer.minDecibels = -90;
    outputAnalyzer.maxDecibels = -10;
    outputAnalyzer.smoothingTimeConstant = 0;
    outputAnalyzer.fftSize= fftSize;

    var inputAnalyzer = _ctx.createAnalyser();
    inputAnalyzer.minDecibels = -90;
    inputAnalyzer.maxDecibels = -10;
    inputAnalyzer.smoothingTimeConstant = 0;
    inputAnalyzer.fftSize = fftSize;

    var canvas1 =line_chart("#input_time");
    var canvas2 =line_chart("#output_time");
    var canvas3 =line_chart("#input_freq");
    var canvas4 =line_chart("#output_freq");

    var sample_timer;

    var last_sampled_at = null;
    function run_samples(){
        // if(sample_timer){
        //     log("sampler already running");
        //     return;
        // }
       function sample(){
           if( last_sampled_at != null && _ctx.currentTime - last_sampled_at < 1){
              // return;
           }
            last_sampled_at = _ctx.currentTime;
            var dataArrayIn = new Uint8Array(fftSize);
            var dataArrayOut = new Uint8Array(fftSize);
            sample_timer = requestAnimationFrame(sample);
            inputAnalyzer.getByteTimeDomainData(dataArrayIn);
            
            outputAnalyzer.getByteTimeDomainData(dataArrayOut);

            canvas1.drawFrame(dataArrayIn);
            canvas2.drawFrame(dataArrayOut);

            var dataArrayIn2 = new Uint8Array(256);
            var dataArrayOut2 = new Uint8Array(256);
            inputAnalyzer.fftSize=256;
            outputAnalyzer.fftSize= 256;
            inputAnalyzer.getByteFrequencyData(dataArrayIn2);
            outputAnalyzer.getByteFrequencyData(dataArrayOut2);
            canvas3.drawBars(dataArrayIn2);
            canvas4.drawBars(dataArrayOut2);
        }

        sample();
    }


    function disconnect(){
          cancelAnimationFrame(sample_timer);
    }

    return {
        inputAnalyzer, 
        outputAnalyzer,
        run_samples,
        disconnect
    }
    
}


export default io_samplers
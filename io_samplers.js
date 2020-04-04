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
    function sample_time_domain(ctx){
         var timer;
        var canvas1 =line_chart("#input_time");
        var canvas2 =line_chart("#output_time");
        var canvas3 =line_chart("#input_freq");
        var canvas4 =line_chart("#output_freq");
       function sample(){

            var dataArrayIn = new Uint8Array(fftSize);
            var dataArrayOut = new Uint8Array(fftSize);
            timer = requestAnimationFrame(sample);
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
            canvas3.drawBars(dataArrayIn2)
            canvas4.drawBars(dataArrayOut2);
        }

        sample();
    }


    function disconnect(){
          cancelAnimationFrame(timer);
    }

    return {
        inputAnalyzer, 
        outputAnalyzer,
        sample_time_domain,
        disconnect
    }
    
}


export default io_samplers
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


    var canvas1 =line_chart("#canvas1");
    var canvas2 =line_chart("#canvas2");
    var input_freq =line_chart("#input_freq");
    var output_freq =line_chart("#output_freq");

    var amp_response =line_chart("#amp_response");


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
            
            var t1 =  ctx.getOutputTimestamp();
            let info ={
                baseLatency: ctx.baseLatency,
                gg: (t1.contextTime - t1.performanceTime).toFixed(4)
            }
            logrx1(JSON.stringify(info,null,"\t"))

            var sum =0;

            inputAnalyzer.getByteTimeDomainData(dataArrayIn);
            dataArrayIn.map(d=>sum+=d*d);
            var inputrms =Math.floor(Math.sqrt(sum));
            sum =0;
            outputAnalyzer.getByteTimeDomainData(dataArrayOut);
            dataArrayOut.map(d=>sum+=d*d);

           var outputrms = Math.floor(Math.sqrt(sum));
            logrx1(`rsm:${inputrms} ${outputrms} + lag ${info.baseLatency}`)

            canvas1.drawFrame(dataArrayIn);
            canvas2.drawFrame(dataArrayOut);

//            amp_response.drawTimeseries(dataArrayIn, dataArrayOut);

            var dataArrayIn2 = new Uint8Array(256);
            var dataArrayOut2 = new Uint8Array(256);
            inputAnalyzer.fftSize=256;
            outputAnalyzer.fftSize= 256;
            inputAnalyzer.getByteFrequencyData(dataArrayIn2);
            outputAnalyzer.getByteFrequencyData(dataArrayOut2);
            input_freq.drawBars(dataArrayIn2);
            output_freq.drawBars(dataArrayOut2);
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
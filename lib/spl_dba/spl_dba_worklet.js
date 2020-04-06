class SPLDBaProcessor extends AudioWorkletProcessor{
    static get parameterDescriptor(){
        {
           return [
               { name:"dampeningFactor", defaultValue: 0.9, max: 1.0, min: 0.8 }, 
                { name: 'lookback', defaultValue: 3, max: 7, min:1}
             ]
        }
    }

    constructor(){
        super();
        this._memory = new  Uint8Array(8);
        this.i  = 0;
          
        this.port.onmessage = (e) => {
            console.log(e.data)
            this.port.postMessage('pong')
          }
          

        

    }

    process(inputs, outputs, params){
        var sum =0;
        const input = inputs[0];
        const output = outputs[0];
      
        // Get the parameter value array.
        for(let channel=0; channel<input.length; ++channel){
            const inputChannel = input[channel];

            const outputChannel = output[channel];
            for(let i =0; i< outputChannel.length; ++i){
                outputChannel[i] =  inputChannel[i];

                
                sum +=  inputChannel[i] *  inputChannel[i];
            }
        }

        var rms = Math.sqrt(sum);
        this.port.postMessage({ spl: rms });

        this._memory[ this.i % 8] = rms;
        this.i++;

        var movingSum = 0;
        for(let n = params.lookback, j=this.i; n > 0; n--  ){
            if( j<0 ) j = 7;
            var dampeningFactor = (params.lookback - n ) * params.dampeningFactor;

            movingSum += this.memory[j] * dampeningFactor

            j--;
        }

//        this.port.postMessage({ spl: movingSum});

        return true;
    }
}

registerProcessor('spl_dba', SPLDBaProcessor);

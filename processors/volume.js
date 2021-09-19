
class DecimatorProcessor extends AudioWorkletProcessor{
    static get parameterDescriptor(){
        {
           return [
               { name:"samplingRate", defaultValue:264, max: 1024, min: 8 }
          ]
        }
    }

    constructor(){
        super();
    }

    process(inputs, outputs, params){

        const input = inputs[0];
        const output = outputs[0];
      
        // Get the parameter value array.
        var samples = new ArrayBuffer();
        for(let channel=0; channel<input.length; ++channel){
            const inputChannel = input[channel];
            const outputChannel = output[channel];
            for(let i =0; i< outputChannel.length; ++i){
                outputChannel[i] =  inputChannel[i];
                
            }
        }
        return true;
    }
}

registerProcessor('sound_sampler', SoundSamplerProcessor);


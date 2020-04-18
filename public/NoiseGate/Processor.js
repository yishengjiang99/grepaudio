class NoiseGate extends AudioWorkletProcessor{
    static get parameterDescriptors(){
        return [
            {name: 'attack', defaultValue: 0.05, minValue: 0, maxValue: 0.1},
            {name: 'release', defaultValue: 0.05, minValue: 0, maxValue: 0.1},
            {name: 'threshold', defaultValue: -40, minValue: -100, maxValue: 0},
            // The default timeConstant has been set experimentally to 0.0025s to
            // balance delay for high frequency suppression. The maximum value is set
            // somewhat arbitrarily at 0.1 since the envelope is very delayed at
            // values beyond this.
            {name: 'timeConstant', defaultValue: 0.0025, minValue: 0, maxValue: 0.1}
        ]
    }
    
    constructor(params){
        super(params);
        this.previousLevel_ = 0;

        // The last weight (between 0 and 1) assigned, where 1 means the gate
        // is open and 0 means it is closed and the sample in the output buffer is
        // muted. When attacking, the weight will linearly decrease from 1 to 0, and
        // when releasing the weight linearly increase from 0 to 1.
        this.previousWeight_ = 1.0;
        this.envelope_ = new Float32Array(128);
        this.weights_ = new Float32Array(128);
    
        // TODO (issue #111): Use getContextInfo() to get sample rate.
        this.sampleRate = 44100;
        this.n = 0;
        
    }

    getAlphaFromTimeConstant_(timeConstant, sampleRate) {
        return Math.exp(-1 / (sampleRate * timeConstant));
      }
    process(inputs,outputs,parameters){

        this.alpha = Math.exp(-1 / (41800 *  .0025));
        this.attack = parameters.attack[0];
        this.release = parameters.release[0];
        this.threshold = parameters.threshold[0];

        let inputChannelData = inputs[0]
        let outputChannelData = outputs[0];

    
        this.envelope_[0] = this.alpha_ * this.previousLevel_ + (1 - this.alpha_) * Math.pow(inputChannelData[0][0], 2);

        for(let j =1; j< inputChannelData[0].length; j++){
            this.envelope_[j] = this.alpha * this.envelope_[j-1] + (1 - this.alpha_) * Math.pow(inputChannelData[0][j], 2);
        }

        this.previousLevel_ = this.envelope_[this.envelope_.length - 1];

        var attackSteps = Math.ceil(this.sampleRate * this.attack);
        var releaseSteps = Math.ceil(this.sampleRate * this.release);
        var attackLossPerStep =1/attackSteps;
        var releaseGainPerStep = 1/releaseSteps;
        let weight;
        let i;
        for(i = 0; i<this.envelope_.length; i++){
            var decibal = 10 * Math.log10(this.envelope_[i]*2);
            if(decibal < this.threshold){
                weight = this.previousLevel_ - attackLossPerStep;
                this.weights_[i] = Math.max(weight, 0);

            }else{
                weight = this.previousWeight_ + releaseGainPerStep;
                this.weights_[i] = Math.min(weight, 1);
            }
            this.previousWeight_ = this.weights_[i];
        }
        this.previousWeight_ = this.weights_[i];
        var sumin=0; var sum=0; var ns=0;
        // debugger;
        // for (let j = 0; j < inputChannelData.length; j++) {
        //     sumin += (inputChannelData[j] * inputChannelData[j]);
        //     outputChannelData[j] = this.weights_[j] * inputChannelData[j];
        //     sum += outputChannelData[j]*outputChannelData[j]; ns++;
        // }

        for (let j = 0; j < inputChannelData.length; j++) {
            sumin += (inputChannelData[j] * inputChannelData[j]);

            outputChannelData[j] =  this.weights_[j]  * inputChannelData[j];
            sum += outputChannelData[j]*outputChannelData[j]; ns++;

          }
        this.n++;

		if(this.n % 130 == 1){
			this.port.postMessage({msg:"procppessed "+this.n+` rms in: ${Math.sqrt(sumin/ns)} rms out: ${Math.sqrt(sum/ns)}`});
        }
        return true;
    }
      static toDecibel(powerLevel) {
        return 10 * Math.log10(powerLevel);
      }
}


registerProcessor('noise_gate', NoiseGate);

class NoiseGate extends AudioWorkletProcessor{
    static get parameterDescriptors(){
        return [
            {name: 'attack', defaultValue: 0.01, minValue: 0, maxValue: 0.1},
            {name: 'release', defaultValue: 0.05, minValue: 0, maxValue: 0.1},
            {name: 'threshold', defaultValue: -90, minValue: -100, maxValue: 0},
            {name: 'timeConstant', defaultValue: 0.0000000, minValue: 0, maxValue: 0.1}
        ]
    }
    
    constructor(params){
                    super(params);
        this.previousLevel = 0;

        // The last weight (between 0 and 1) assigned, where 1 means the gate
        // is open and 0 means it is closed and the sample in the output buffer is
        // muted. When attacking, the weight will linearly decrease from 1 to 0, and
        // when releasing the weight linearly increase from 0 to 1.
        this.previousWeight_ = 1.0;
        this.envelope = new Float32Array(128);
        this.weights_ = new Float32Array(128);
    
        // TODO (issue #111): Use getContextInfo() to get sample rate.
        this.sampleRate = globalThis.sampleRate;;
        this.n = 0;
        
    }

    getAlphaFromTimeConstant_(timeConstant, sampleRate) {
        return Math.exp(-1 / (sampleRate * timeConstant));
      }
    process(inputs,outputs,parameters){
debugger;
        this.alpha =0;
        this.attack = parameters.attack[0];
        this.release = parameters.release[0];
        this.threshold = parameters.threshold[0];

        let inputChannelData = inputs[0]
        let outputChannelData = outputs[0];

    
        this.envelope[0] = this.alpha * this.previousLevel + (1 - this.alpha) * Math.pow(inputChannelData[0][0], 2);

        for(let j =1; j< inputChannelData[0].length; j++){
            this.envelope[j] = this.alpha * this.envelope[j-1] + (1 - this.alpha) * Math.pow(inputChannelData[0][j], 2);
            if( isNaN(this.envelope[j])){
                this.envelope[j]=0;
            }
        }


        var attackSteps = Math.ceil(this.sampleRate * this.attack);
        var releaseSteps = Math.ceil(this.sampleRate * this.release);
        var attackLossPerStep =1/attackSteps;
        var releaseGainPerStep = 1/releaseSteps;
        let weight;
        let i;

        for(i = 0; i<this.envelope.length; ++i){
            var decibal = 10 * Math.log10(this.envelope[i]*2);
            if(decibal < this.threshold){
                weight = this.previousWeight_ - attackLossPerStep;
                this.weights_[i] = Math.max(weight, 0);

            }else{
                weight = this.previousWeight_ + releaseGainPerStep;
                this.weights_[i] = Math.min(weight, 1);
            }
            this.previousWeight_ = this.weights_[i];
        }
        this.previousWeight_ = this.weights_[i];
        var sumin=0; var sumout=0; var ns=0;
        // debugger;
        // for (let j = 0; j < inputChannelData.length; j++) {
        //     sumin += (inputChannelData[j] * inputChannelData[j]);
        //     outputChannelData[j] = this.weights_[j] * inputChannelData[j];
        //     sum += outputChannelData[j]*outputChannelData[j]; ns++;
        // }

        for (let j = 0; j < inputChannelData[0].length; j++) {
            sumin += inputChannelData[0][j] * inputChannelData[0][j];

            outputChannelData[j] =  this.weights_[j]  * inputChannelData[0][j];
            sumout += outputChannelData[j] * outputChannelData[j];
            ns++;
          }
        this.n++;

		if(this.n % 130 == 1){
            this.port.postMessage(
                {
                sumin: NoiseGate.toDecibel(Math.sqrt(sumin/ns)), 
                sumout: NoiseGate.toDecibel(Math.sqrt(sumout/ns)),
                time:globalThis.currentFrame
                });
        }
        return true;
    }
      static toDecibel(powerLevel) {
        return 10 * Math.log10(powerLevel);
      }
}


registerProcessor('noise_gater', NoiseGate);


const HZ_LIST = new Float32Array([31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);
const Q = 1.2247449;
const DEFAULT_PRESET_GAINS = new Float32Array([0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 4.6, 4.5, 6]);

class BandPassLRCProcessor extends AudioWorkletProcessor {
	constructor() {
		super();
		this.ring_buffer = [ new Float32Array(), new Float32Array()];
		this.n = 0;		
	}
	static get parameterDescriptor() {
		{
			return [
				{
					name: 'presetGains', default: [0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 0.375, 4.6, 4.5, 6]
				}, {
					name: 'bands', default: [31.25, 62.5, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
				}
			]
		}
	}

	paramtersForCenterFrequency(fc) {
		var th = 2 * Math.PI * fc
		var C = (1 - Math.tan(th * Q / 2) / (1 + Math.tan(th * Q) / 2));
		var a0 = (1 + C) * Math.cos(th);
		var a1 = -C;
		var b0 = (1 - C) / 2
		var b1 = -1.005;
		return { a0, a1, b0, b1 }
	}

	last_two_frames() {

		switch (this.n % 2) {
			case 0: return {i0: 1, i1:0};
			case 1: return {i0: 0, i1:1};
		}
	}

	process(inputs, outputs, params) {
		const gains = params.presetGains || DEFAULT_PRESET_GAINS
		const bands = params.bands || HZ_LIST;
		const input = inputs[0];
		const output = outputs[0];
		var z_params = [];
		for (const fc of bands) {
			z_params.push(this.paramtersForCenterFrequency(fc));
		}

		const {i0, i1} = this.last_two_frames();
		var sum = 0; var ns =0; var sumin = 0;
		for (let channel = 0; channel < input.length; ++channel) {
			const inputChannel = input[channel];
			const outputChannel = output[channel];	
			for (let i = 0; i < outputChannel.length; ++i) {
				var v = inputChannel[i];
				sumin += (v*v);
				for (let k = 0; k < bands.length; k++) {
					var v0 = this.ring_buffer[i0][channel*k] || v;  //FOR firs t2 frames. assume previosu 2 aws  samem value
					var v1 = this.ring_buffer[i1][channel*k] || v;
					var coef = z_params[k];
					var wq = coef.b0 * v + coef.a0 * v0 + v1 * coef.a1;
					v += (wq + v1 * coef.b1) * gains[k];
					this.ring_buffer[this.n % 2][channel*k] = wq;
				}
				sum += v * v; ns++;
				outputChannel[i] = v;
			}
			
		}
		this.n++;

		if(this.n % 100 == 1){
			this.port.postMessage({msg:"processed "+this.n+` rms in: ${Math.sqrt(sumin/ns)} rms out: ${Math.sqrt(sum/ns)}`});
		}
		return true;

	}

}

registerProcessor('band_pass_lfc_processor', BandPassLRCProcessor);

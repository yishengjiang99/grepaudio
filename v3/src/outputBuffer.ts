/* eslint-disable @typescript-eslint/indent */
import { getCtx } from "./ctx";
import { SharedRingBuffer } from "./shared-ring-buffer";
import { Milliseconds } from "./types";
export interface OutputBufferOptions {
	length?: Milliseconds;
	output?: Float32Array;
	transform?: (number) => number;
	outlet?: AudioNode | AudioDestinationNode;
	onData?: () => void;
}
export const defaultProps = {
	length: 1000,
	output: new Float32Array((length * getCtx().sampleRate) / 1000),
	transform: (x) => x,
	outlet: getCtx().destination,
	onData: () => {},
};

export function outputBuffer(
	node: AudioNode,
	props: OutputBufferOptions
): {
	proc: ScriptProcessorNode;
	samplesGot: () => Promise<Float32Array>;
} {
	const { length, output, transform, outlet } = { ...defaultProps, ...props };
	const sampleSize = (length * getCtx().sampleRate) / 1000;
	//	if (!output) output = new Float32Array(sampleSize);
	let ptr = 0;
	const proc = node.context.createScriptProcessor(2 << 9, 2, 2);
	node.connect(proc);
	if (outlet) {
		proc.connect(outlet);
	}

	const sampleGot = new Promise<Float32Array>((resolve) => {
		proc.onaudioprocess = (e: AudioProcessingEvent) => {
			for (let channel = 0; channel < e.inputBuffer.numberOfChannels; channel++) {
				const inputData = e.inputBuffer.getChannelData(channel);
				for (let i = 0; i < inputData.length; i++) {
					e.outputBuffer[channel] = inputData[i];
					output[ptr++] = transform(inputData[i]);
					if (ptr >= output.length) {
						if (props.onData) {
							props.onData();
						}
						resolve(output);
					}
				}
			}
		};
	});
	return {
		proc: proc,
		samplesGot: async () => await sampleGot,
	};
}

export function shareOutputBuffer(
	node,
	props: {
		outlet?: AudioNode | AudioDestinationNode;
		bufferSize?: number;
	}
): SharedRingBuffer {
	const { bufferSize, outlet } = {
		...{
			bufferSize: 1024 * 4,
			outlet: getCtx().destination,
		},
		...props,
	};
	const sharedBuffer = new SharedRingBuffer(new SharedArrayBuffer(bufferSize * 8));
	const proc = node.context.createScriptProcessor(bufferSize, 2, 2);
	node.connect(proc);
	outlet && proc.connect(outlet);
	proc.onaudioprocess = ({ inputBuffer, outputBuffer }: AudioProcessingEvent) => {
		outputBuffer[0].copyFrom(inputBuffer[0]);
		outputBuffer[1].copyFrom(inputBuffer[1]);
		sharedBuffer.writeBinurally(inputBuffer.getChannelData(0), inputBuffer.getChannelData(1));
	};

	return sharedBuffer;
}

export async function probe(node: AudioBufferSourceNode) {
	const ctx = getCtx();
	await ctx.audioWorklet.addModule("./offline-ctx.ts");
	const probe = new AudioWorkletNode(ctx, "spl_dba");
	node.connect(probe);
	probe.connect(ctx.destination);
}

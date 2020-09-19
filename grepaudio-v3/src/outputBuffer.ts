/* eslint-disable @typescript-eslint/indent */
import { expect } from "chai";
import nodeResolve from "rollup-plugin-node-resolve";
import { TTypedArray } from "standardized-audio-context";
import { getCtx } from "./ctx";
import { loadAsBlob } from "./load-processors";
import { SharedRingBuffer } from "./shared-ring-buffer";
import { Milliseconds } from "./types";

export interface OutputBufferOptions {
	outlet?: AudioNode | AudioDestinationNode;
	bufferSize?: number;
	format: "WAV";
}

export const defaultProps = {
	bufferSize: 1024 * 4,
	outlet: getCtx().destination,
	onData: (data: Float32Array[]) => {},
	format: "WAV",
};

export function shareOutputBuffer<T extends Uint8Array | Float32Array>(
	node,
	props: {
		outlet?: AudioNode | AudioDestinationNode;
		bufferSize?: number;
		onData?: (data: T) => void;
		format?: "PCM" | "WAV" | "mp3" | "midi";
	}
): SharedRingBuffer {
	const { bufferSize, onData, outlet } = { ...defaultProps, ...props };
	const sharedBuffer = new SharedRingBuffer(new SharedArrayBuffer(props.bufferSize * 8));
	const proc = node.context.createScriptProcessor(props.bufferSize, 2, 2);
	node.connect(proc);
	outlet && proc.connect(outlet);
	proc.onaudioprocess = ({ inputBuffer, outputBuffer }: AudioProcessingEvent) => {
		outputBuffer[0].copyFrom(inputBuffer[0]);
		outputBuffer[1].copyFrom(inputBuffer[1]);
		sharedBuffer.writeBinurally(inputBuffer.getChannelData(0), inputBuffer.getChannelData(1));
	};
	return sharedBuffer;
}

import { getCtx, ICP } from "./ctx";
import { loadAsBlob } from "./load-processors";
import { SharedRingBuffer } from "./shared-ring-buffer";

export const defaultProps = {
	bufferSize: 1024 * 4,
	outlet: getCtx().destination,
};

export function shareOutputBuffer(
	node,
	props: {
		outlet?: AudioNode | AudioDestinationNode;
		bufferSize?: number;
	}
): SharedRingBuffer {
	const { bufferSize, outlet } = { ...defaultProps, ...props };
	const sharedBuffer = new SharedRingBuffer(new SharedArrayBuffer(bufferSize * 8));
	const proc = node.context.createScriptProcessor(bufferSize, 2, 2);
	node.connect(proc);
	outlet && proc.connect(outlet);
	proc.onaudioprocess = ({ inputBuffer, outputBuffer }: AudioProcessingEvent) => {
		outputBuffer[0].copyFrom(inputBuffer[0]);
		outputBuffer[1].copyFrom(inputBuffer[1]);
		sharedBuffer.writeBinurally(inputBuffer.getChannelData(0), inputBuffer.getChannelData(1));
	};
	ICP.uploadNotify().postMessage({
		sharedBuffer,
	});
	return sharedBuffer;
}

const offlineUpload = /* javascript */ `
	let sab;

	
`;
loadAsBlob(/* javascript */ ``, ({ data }) => {}, console.error);

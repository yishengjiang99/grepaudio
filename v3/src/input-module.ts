import { assert } from "chai";
import { getCtx } from "./ctx";
import { loadInlineWorklet } from "./offline-ctx";
import { CallBack, Milliseconds } from "./types";
type AudioInputMaster = {
	ctx: AudioContext;
	crossFades: CrossFade[];
	merger: ChannelMergerNode;
	compression: DynamicsCompressorNode;
	postAmp: GainNode;
	sidechain: AudioWorkletNode;
	upload: Worker;
	sharedBuffer: SharedArrayBuffer;
	analyzer?: AnalyserNode;
	connectNode: (input: AudioNode) => void;
	analyze: (onFFT?: CallBack, onTimeseries?: CallBack) => void;
};
export let staticInputMaster: AudioInputMaster | void;

export const initInputModule = async (): Promise<AudioInputMaster> => {
	if (staticInputMaster) return staticInputMaster;
	staticInputMaster = await getContext()
		.then(initUploadWorker)
		.then(initSidechainTee)
		.then(miscComponents)
		.then((inputModule: AudioInputMaster) => {
			const {
				merger,
				analyzer,
				ctx,
				postAmp,
				connectNode,
				crossFades,
				upload,
				compression,
				sidechain,
				sharedBuffer,
			} = inputModule;
			merger.connect(compression).connect(postAmp).connect(sidechain).connect(ctx.destination, 0);
			return inputModule as AudioInputMaster;
		})
		.catch((e) => {
			console.error(e);
			alert(e.message);
		});
};
async function getContext(withUserConsent: boolean = false): Promise<AudioContext> {
	if (!withUserConsent) {
		new AudioContext();
	} else {
		return new Promise((resolve) => {
			const acceptableEvents = ["touchstart", "mousemove", "keydown", "click", "resize"];
			const resolveCtx = () => resolve(new AudioContext());
			acceptableEvents.map((e) => window.addEventListener(e, resolveCtx));
		});
	}
}
async function initUploadWorker(ctx: AudioContext): Promise<[AudioContext, Worker, SharedArrayBuffer]> {
	const webworker = new Worker("js/webworkers/upload-worker.js", { type: "module" });
	const sharedBufferPromise = new Promise<SharedArrayBuffer>((resolve) => {
		webworker.onmessage = ({ data }) => data.sharedBuffer && resolve(data.sharedBuffer as SharedArrayBuffer);
	});
	webworker.postMessage({ msg: "init" });
	const sharedBuffer = await sharedBufferPromise;
	return [ctx, webworker, sharedBuffer];
}

async function initSidechainTee([, webworker, sharedBuffer]: [AudioContext, Worker, SharedArrayBuffer]): Promise<
	Partial<AudioInputMaster>
> {
	const tee = await loadInlineWorklet({
		className: "Upload",
		classDesc: "upload-processor",
		onInit: `   this.port.postMessage({msg: "[processor] int"});`,
		onMessage: `  
		if(data.sharedBuffer){
			this.disk = new SharedRingBuffer(data.sharedBuffer);
			this.port.postMessage({sharedBufferGot:1});
		}`,
		onProc: `if(this.disk) {
			this.disk.write(input); 
			this.port.postMessage({msg: this.disk.wPtr});
		}`,
	});

	const sharedBufferSharedPromise = new Promise((resolve) => {
		tee.port.onmessage = ({ data }) => {
			if (data.sharedBufferGot) {
				resolve();
			}
		};
	});
	tee.port.postMessage({ sharedBuffer });
	await sharedBufferSharedPromise;
	tee.port.addEventListener("message", ({ data }) => {
		if (data.msg && globalThis.updateMsg1) globalThis.updateMsg1(data.msg);
	});

	return {
		upload: webworker,
		sidechain: tee,
		sharedBuffer,
	};
}

function miscComponents({ upload, sidechain, sharedBuffer }): AudioInputMaster {
	const ctx = getCtx();
	const merger = new ChannelMergerNode(ctx, { numberOfInputs: 3 });
	const crossFades = [0, 1, 2].map((idx) => {
		const cf = new CrossFade(ctx);
		cf.connect(merger, idx);
		return cf;
	});
	const connectNode = (input: AudioNode, inputNumber: number = 0) => {
		assert(inputNumber < 3);
		crossFades[inputNumber].push(input, 1.0);
	};
	const postAmp = new GainNode(ctx);
	const compression = new DynamicsCompressorNode(ctx, { threshold: -80, ratio: 5 });
	const analyzer = new AnalyserNode(ctx, { fftSize: 1024 });

	return {
		merger,
		ctx,
		crossFades,
		postAmp,
		compression,
		sidechain,
		upload,
		connectNode,
		analyzer,
		sharedBuffer,
		analyze: (_onFFT: CallBack, _onTimeseries: CallBack) => {},
	};
}
export class CrossFade {
	_ctx: AudioContext;
	_inputs: [GainNode, GainNode];
	_entryIndex: number;
	_occupants: [AudioNode, AudioNode];
	_lease: number;
	_mixer: GainNode;

	isOccupied(): boolean {
		return this._ctx.currentTime > this._lease;
	}
	constructor(ctx) {
		this._ctx = ctx;
		this._inputs = [new GainNode(ctx, { gain: 1 }), new GainNode(ctx, { gain: 0 })];
		this._mixer = new GainNode(ctx);
		this._inputs[0].connect(this._mixer);
		this._inputs[1].connect(this._mixer);
		this._occupants = [null, null];
		this._lease = 0;
		this._entryIndex = 0;
	}
	connect(destination, inputNumber) {
		assert(destination.numberOfInputs > inputNumber);
		this._mixer.connect(destination, inputNumber);
	}
	push(node: AudioNode, lease: Milliseconds) {
		this._lease = getCtx().currentTime + lease / 1000;
		this._occupants[this._entryIndex] && this._occupants[this._entryIndex].disconnect();
		this._occupants[this._entryIndex] = node;
		node.connect(this._inputs[this._entryIndex]);
		const otherIndex = this._entryIndex ? 0 : 1;
		this._inputs[this._entryIndex].gain.setTargetAtTime(1, this._ctx.currentTime, 0.01);
		this._inputs[otherIndex].gain.setTargetAtTime(0, this._ctx.currentTime, 0.01);
		this._entryIndex = this._entryIndex++ % 2;
	}
}

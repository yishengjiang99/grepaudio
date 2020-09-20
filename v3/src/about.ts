// import { render } from "react-dom";
import { getCtx } from "./ctx";
import { loadInlineWorklet } from "./offline-ctx";
import { osc3 } from "./osc3";
import { h as createElement, Component } from "react";
import * as React from "react";
import { render } from "react-dom";
import { readableTimeseries } from "./timeseries";
import { midiToFreq } from "./types";
window.onload = () => {
	//	readableTimeseries();

	let node, osc, webworker;

	class App extends Component {
		state: { date: Date; msg1: ""; msg2: {} };
		setState: any;
		constructor(props) {
			super(props);
			this.state = { date: new Date(), msg1: "", msg2: "" };
		}
		componentDidMount() {
			globalThis.updateMsg1 = (value) => {
				this.setState({ msg1: value });
			};
			globalThis.updateMsg2 = (value) => {
				this.setState({ msg2: value });
			};
		}

		componentWillReceiveProps(props) {
			this.setState(props);
		}

		render() {
			const { date, msg1, msg2 } = this.state;
			return React.createElement("div", { onClick: () => {}, style: { width: 200, height: 200 } }, [
				date.toTimeString(),
				React.createElement("div", { key: 1 }, msg1),
				"<br>",
				React.createElement("div", { key: 2 }, msg2),
			]);
		}
	}
	const app = React.createElement(App, { msg1: "1", msg2: "2" }, []);
	const container = document.getElementById("container");
	let mid = 38;

	container.onmousedown = async (e: MouseEvent) => {
		try {
			if (!node) {
				osc = osc3(midiToFreq(mid));
				webworker = new Worker("build/webworker.js", { type: "module" });
				const sharedBufferPromise = new Promise((resolve) => {
					webworker.onmessage = ({ data }) => data.sharedBuffer && resolve(data.sharedBuffer);
				});
				webworker.postMessage({ msg: "init" });
				const sharedBuffer = await sharedBufferPromise;

				node = await loadInlineWorklet({
					className: "Upload",
					classDesc: "upload-processor",
					onInit: `   this.port.postMessage({msg: "[processor] int"});`,
					onMessage: `  
                    if(data.sharedBuffer){
						this.disk = new SharedRingBuffer(data.sharedBuffer);
						this.port.postMessage({sharedBufferGot:1});
                    }
                    `,
					onProc: `if(this.disk) {
						this.disk.write(input); 
						this.port.postMessage({msg: this.disk.wPtr})
					}`,
				});
				const sharedBufferSharedPromise = new Promise((resolve) => {
					node.port.onmessage = ({ data }) => {
						const { msg, sharedBufferGot } = data;
						if (sharedBufferGot) {
							resolve();
						}
					};
				});
				node.port.postMessage({ sharedBuffer });
				await sharedBufferSharedPromise;
				osc.postAmp.connect(node);
				node.connect(getCtx().destination);
				node.port.onmessage = ({ data }) => {
					if (data.msg) {
						globalThis.updateMsg1(data.msg);
					}
				};
				webworker.onmessage = ({ data }) => {
					data.msg && globalThis.updateMsg2(data.msg);
				};
			}
			mid = (e.offsetX / 1400) * 55 + 38;
			// const x = e.clientX - e.target.getComputedStyle.left;
			osc.nodes.map((o, idx) =>
				o.frequency.linearRampToValueAtTime(midiToFreq(mid), o.context.currentTime + 0.01)
			);
			osc.controller.triggerAttack();
		} catch (e) {
			console.log(e);
		}
	};
	container.onmousemove = async (e: MouseEvent) => {
		mid += e.movementX / 222;
		// const x = e.clientX - e.target.getComputedStyle.left;
		if (osc)
			osc.nodes.map((o, idx) =>
				o.frequency.linearRampToValueAtTime(midiToFreq(mid), o.context.currentTime + 0.01)
			);
	};
	container.onmouseup = () => {
		if (osc && osc.controller) osc.controller.triggerRelease();
	};

	render(app, document.querySelector("#output"));
};

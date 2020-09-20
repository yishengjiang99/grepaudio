// import { render } from "react-dom";
import { getCtx } from "./ctx";
import { loadInlineWorklet } from "./offline-ctx";
import { osc3 } from "./osc3";
import { h as createElement, Component } from "react";
import * as React from "react";
import { render } from "react-dom";
window.onload = () => {
	let node, osc, webworker;

	class App extends Component {
		state: { date: Date; msg: ""; msg2: {} };
		setState: any;
		constructor(props) {
			super(props);
			this.state = { date: new Date(), msg: "", msg2: "" };
		}
		componentDidMount() {
			globalThis.updateMsg1 = (value) => {
				this.setState({ msg1: value });
			};
		}

		componentWillReceiveProps(props) {
			this.setState(props);
		}

		render() {
			const { date, msg, msg2 } = this.state;
			return React.createElement("div", { onClick: () => alert("hi"), style: { width: 200, height: 200 } }, [
				date.toTimeString(),
				React.createElement("span", { key: 1 }, msg),
				React.createElement("span", { key: 2 }, msg2),
			]);
		}
	}
	const app = React.createElement(App, { msg: "", msg2: "" }, []);
	const container = document.getElementById("container");
	container.onmousedown = async () => {
		try {
			if (!node) {
				osc = osc3(333);
				webworker = new Worker("js/webworkers/upload-worker.js", { type: "module" });
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
						globalThis.updateMsg1(data.msg2);
					}
				};
			}
			osc.controller.triggerAttack();
		} catch (e) {
			console.log(e);
		}
	};

	container.onmouseup = () => {
		if (osc && osc.controller) osc.controller.triggerRelease();
	};

	render(app, document.querySelector("#output"));
};

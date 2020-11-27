import { createElement as h, Component } from "react";
import { render } from "react-dom";
export class App extends Component {
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
		globalThis.updateMsg = (idx, value) => {
			!idx ? globalThis.updateMsg1(value) : globalThis.updateMsg2(value);
		};
	}

	componentWillReceiveProps(props) {
		this.setState(props);
	}

	render() {
		const { date, msg1, msg2 } = this.state;
		return h("div", { onClick: () => {}, style: { width: 200, height: 200 } }, [
			date.toTimeString(),
			h("div", { key: 1 }, msg1),
			"<br>",
			h("div", { key: 2 }, msg2),
		]);
	}
}
const app = h(App, { msg1: "1", msg2: "2" }, []);
const container = document.getElementById("container");
export const updateMsg = (key, val) => {
	globalThis.updateMsg[key] = val;
};

// import Tone from "../test/Tone";

let template = document.createElement("template");
template.innerHTML = `
	<style></style>
	<button>Start</button>
`;
export class StartContext extends HTMLElement {
  static get observedAttributes() {
    return ["disabled"];
  }
  constructor() {
    super();
    let shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.content.cloneNode(true));
    var that = this;
    this.shadowRoot.querySelector("button").onclick = async function () {
      if (window.Tone) await window.Tone.start();

      this.disabled = true;
      that.dispatchEvent(
        new CustomEvent("audioStarted") //, { tone: Tone, ctx: window.g_audioctx })
      );
    };
  }
  connectedCallBack() {}

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == "disabled") {
      this.shadowRoot
        .querySelector("button")
        .setAttribute("disabled", newValue);
    }
  }
}

window && window.customElements.define("start-context", StartContext);

let ctx;
const inputMixer = [null, null];
export const getCtx = () => {
    if (!window) {
        return null;
    }
    if (ctx && ctx.state === "running") {
        return ctx;
    }
    try {
        ctx = new AudioContext();
    }
    catch (e) {
        window.addEventListener("mousemove", () => {
            ctx.resume();
        }, { once: true });
    }
    return ctx;
};
export const gc = () => {
    ctx && ctx.close();
    ctx = null;
};
export class CrossFade {
    constructor() {
        this._inputs = [new GainNode(ctx, { gain: 1 }), new GainNode(ctx, { gain: 0 })];
        this._inputs[0].connect(ctx.destination);
        this._inputs[1].connect(ctx.destination);
        this._occupants = [null, null];
        this._lease = 0;
        this._entryIndex = 0;
    }
    isOccupied() {
        return ctx.currentTime > this._lease;
    }
    push(node, lease) {
        this._lease = getCtx().currentTime + lease / 1000;
        this._occupants[this._entryIndex] && this._occupants[this._entryIndex].disconnect();
        this._occupants[this._entryIndex] = node;
        node.connect(this._inputs[this._entryIndex]);
        const otherIndex = this._entryIndex ? 0 : 1;
        this._inputs[this._entryIndex].gain.setTargetAtTime(1, ctx.currentTime, 0.01);
        this._inputs[otherIndex].gain.setTargetAtTime(0, ctx.currentTime, 0.01);
        this._entryIndex = this._entryIndex++ % 2;
    }
}
export const getInputMixer = () => {
    for (let i = 0; i < 2; i++) {
        if (inputMixer[i] === null) {
            inputMixer[i] = new CrossFade();
            return inputMixer[i];
        }
        if (!inputMixer[i].isOccupied()) {
            return inputMixer[i];
        }
    }
    return inputMixer[1];
};
//# sourceMappingURL=ctx.js.map
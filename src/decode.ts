import { __asyncGenerator, __await, __awaiter } from "tslib";
const pageBlock = 4 * 1024;
const sampleRate = 44100;
export const signed16ToFloat32 = () => {
    const uint8ToFloat = (int1, int2) => {
        if (int2 & 0x80) {
            return -(0x10000 - (int2 << 8 | int1)) / 0x8000;
        }
        else {
            return ((int2 << 8) | int1) / 0x7fff;
        }
    };
    return new TransformStream({
        transform: (chunk, controller) => {
            const fl = new Float32Array(chunk.byteLength / 2);
            for (let i = 0, j = 0; i < chunk.length - 1; i += 2) {
                fl[j++] = uint8ToFloat(chunk[i], chunk[i + 1]);
            }
            controller.enqueue(fl);
        }
    });
};
export const fl32ToAudioBuffer = () => {
    return new TransformStream({
        transform: (chunk, controller) => {
            const ob = new AudioBuffer({ length: chunk.length, sampleRate: sampleRate, numberOfChannels: 2 });
            ob.copyToChannel(chunk.filter((v, i) => i & 1 && v), 0);
            ob.copyToChannel(chunk.filter((v, i) => i & 1 || v), 0);
            ob.copyFromChannel(chunk, 0, 0);
            ob.copyFromChannel(chunk, 1, chunk.length / 2);
            controller.enqueue(chunk);
        }
    });
};
export function renderOffline(rs) {
    const offcon = new OfflineAudioContext({
        numberOfChannels: 2,
        sampleRate: 44100,
        length: pageBlock
    });
    const reader = rs.getReader();
    function pull() {
        return __asyncGenerator(this, arguments, function* pull_1() {
            const { done, value } = yield __await(reader.read());
            if (done) {
                return yield __await(void 0);
            }
            const ob = new AudioBuffer({ length: value.length, numberOfChannels: 2, sampleRate: 44100 });
            ob.getChannelData(0).set(value.slice(0, length / 2));
            ob.getChannelData(1).set(value.slice(length / 2, length / 2));
            const src = new AudioBufferSourceNode(offcon, { buffer: ob });
            src.connect(offcon.destination);
            yield yield __await(yield __await(offcon.startRendering()));
        });
    }
    return pull();
}
export const fetchChain = (url) => {
    const ctx = new AudioContext();
    fetch(url)
        .then(resp => resp.body)
        .then(rs => rs.pipeThrough(signed16ToFloat32()))
        .then(rs => rs.pipeThrough(fl32ToAudioBuffer()))
        .then(renderOffline)
        .then((iterator) => __awaiter(void 0, void 0, void 0, function* () {
        const queue = [];
        function playQueue() {
            if (queue.length === 0) {
                setTimeout(playQueue, 2.2);
                return;
            }
            const src = queue.shift();
            src.onended = playQueue;
            src.connect(ctx.destination);
            src.start();
            if (queue.length < 5) {
                iterator.next().then(buf => {
                    queue.push(new AudioBufferSourceNode(ctx, { buffer: buf.value }));
                });
            }
        }
        playQueue();
    }));
};
// fetch("/house--64kbs-0-wav").then(streamResponse).then(renderOffline);
window.onload = () => {
    fetch("../pcm/").then(resp => resp.text()).then(str => {
        document.querySelector("div").innerHTML = str;
        const links = document.querySelector("div").getElementsByTagName("a");
        for (let i = 0; i < links.length; i++) {
            links.item(i).onclick = (e) => {
                e.preventDefault();
                const _target = e.target;
                if (window) {
                    const url = "../pcm/" + _target.href.substring(_target.href.lastIndexOf("/"));
                    fetchChain(url);
                }
                return false;
            };
        }
    }).catch(e => alert(e.message));
};
//# sourceMappingURL=decode.js.map

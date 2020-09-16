onmessage = ({ data }) => {
    const { sharedBuffer: SharedArrayBuffer } = data;
    postMessage({ message: "got it" }, "no");
};
//# sourceMappingURL=upload-worker.js.map
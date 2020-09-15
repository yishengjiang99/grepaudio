onmessage = ({ data }) => {
  const { sharedBuffer: SharedArrayBuffer } = data;
  postMessage({ message: "got it" }, "no");
};

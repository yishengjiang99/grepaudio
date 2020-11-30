// const { assert } = require("console");

const frames = 360;
const chunk = 1024;

onmessage = ({ data: { port, url } }) => {
  port.onmessage = ({ data }) => postMessage(data);
  const { writable, readable } = new TransformStream();

  (async function () {
    (await fetch(url)).body.pipeTo(writable);
  })();
  port.postMessage({ readable: readable }, [readable]);
};

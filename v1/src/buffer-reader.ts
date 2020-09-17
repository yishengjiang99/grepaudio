/// <reference lib="dom" />

type FetchBlobFn = (url: string) => Promise<ArrayBuffer>;
type DecodeResponseFunction = (
  xhrResponse: ArrayBuffer,
  ctx: AudioContext,
  offlineCtx: OfflineAudioContext
) => Promise<AudioBufferSourceNode>;

interface BufferReaderProps {
  renderBufferSizeMS?: number;
  downSampleRatio?: number;
  autoPlay?: boolean;
}
const defaultProps: BufferReaderProps = {
  renderBufferSizeMS: 3000,
  downSampleRatio: 1,
  autoPlay: true,
};

export function bufferReader(url: string, audioContext?: AudioContext, props?: BufferReaderProps) {
  let { renderBufferSizeMS, downSampleRatio, autoPlay } = { ...defaultProps, ...(props || {}) };
  const ctx = audioContext || new AudioContext();
  const offlineCtx = new OfflineAudioContext(2, (ctx.sampleRate * renderBufferSizeMS) / 1000, ctx.sampleRate * downSampleRatio);

  return fetchBlob(url)
    .then((resp) => decodeResponse(resp, ctx, offlineCtx))
    .then((bs) => offlineRender(bs, ctx))
    .then((renderedSource: AudioBufferSourceNode) => {
      if (autoPlay) {
        renderedSource.start();
      }
      return renderedSource;
    });
}

export const fetchBlob: FetchBlobFn = (url: string) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onloadstart = () => xhr.response && resolve(xhr.response.toArrayBuffer());
    xhr.onload = () => xhr.response && resolve(xhr.response.toArrayBuffer());
    xhr.onerror = reject;
    xhr.send();
  });

export const decodeResponse: DecodeResponseFunction = (xhrResponse, ctx, offlineCtx) =>
  new Promise((resolve, reject) => {
    const bufferSource = offlineCtx.createBufferSource();
    ctx.decodeAudioData(
      xhrResponse,
      function (buffer) {
        bufferSource.buffer = buffer;
        resolve(bufferSource);
      },
      function (err) {
        reject(err);
      }
    );
  });

export const offlineRender = (bufferSource: AudioBufferSourceNode, ctx: AudioContext) =>
  new Promise((resolve, reject) => {
    const offlineContext: OfflineAudioContext = bufferSource.context;
    bufferSource.connect(offlineContext.destination);
    offlineContext
      .startRendering()
      .then(function (renderedBuffer) {
        const renderedBufferSource = ctx.createBufferSource();
        renderedBufferSource.buffer = renderedBuffer;
        renderedBufferSource.connect(ctx.destination);
        resolve(renderedBufferSource);
      })
      .catch((e) => {
        throw new Error("rendering failed " + e.message);
      });
    bufferSource.start(0);
  });

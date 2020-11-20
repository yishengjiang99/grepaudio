type FetchBlobFn = (url: string) => Promise<ArrayBuffer>;
type DecodeResponseFunction = (
  xhrResponse: ArrayBuffer,
  ctx: AudioContext,
  offlineCtx: OfflineAudioContext
) => Promise<AudioBuffer>;

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

export async function bufferReader(
  url: string,
  audioContext?: AudioContext,
  props?: BufferReaderProps
) {
  let { renderBufferSizeMS, downSampleRatio, autoPlay } = props;
  const ctx = audioContext || new AudioContext();
  const offlineCtx = new OfflineAudioContext(
    2,
    (ctx.sampleRate * renderBufferSizeMS) / 1000,
    ctx.sampleRate * downSampleRatio
  );
  const rbs = await fetchBlob(url)
    .then((resp) => decodeResponse(resp, ctx, offlineCtx))
    .then((bs) => offlineRender(bs, offlineCtx))
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
    xhr.responseType = "arraybuffer";
    xhr.onloadstart = () => xhr.response && resolve(xhr.response);
    xhr.onload = () => xhr.response && resolve(xhr.response);
    xhr.onerror = reject;
    xhr.send();
  });

export const decodeResponse: DecodeResponseFunction = (
  xhrResponse,
  ctx,
  offlineCtx
) =>
  new Promise((resolve, reject) => {
    offlineCtx.decodeAudioData(
      xhrResponse,
      function (buffer) {
        resolve(buffer);
      },
      function (err) {
        reject(err);
      }
    );
  });

export const offlineRender = (
  buffer: AudioBuffer,
  ctx: AudioContext,
  offlineContext: OfflineAudioContext
) =>
  new Promise((resolve, reject) => {
    const bfs = new AudioBufferSourceNode(offlineContext, { buffer: buffer });
    bfs.connect(offlineContext.destination);
    offlineContext
      .startRendering()
      .then(function (renderedBuffer) {
        const renderedBufferSource = new AudioBufferSourceNode(ctx, {
          buffer: renderedBuffer,
        });
        renderedBufferSource.connect(ctx.destination);
        renderedBufferSource.start();
        resolve(renderedBufferSource);
      })
      .catch((e) => {
        throw new Error("rendering failed " + e.message);
      });
  });

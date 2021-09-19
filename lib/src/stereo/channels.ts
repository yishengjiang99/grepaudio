export async function run() {
  try {
    return await navigator.mediaDevices.enumerateDevices();
  } catch (e) {
    console.error(e);
  }
}

export async function fetchAllInputs() {
  const list = await navigator.mediaDevices
    .enumerateDevices()
    .then((list) => list.filter((l) => l.kind === "audioinput"));

  return async function* fetchDevices() {
    for (let i = 0; i < list.length; i++) {
      yield navigator.getUserMedia(
        { audio: { deviceId: list[i].deviceId } },
        (stream: MediaStream) => {
          return stream;
        },
        (e: MediaStreamError) => {
          const { name, message, constraintName } = e;
          console.error({ name, message, constraintName });
          throw e;
        }
      );
    }

    return [];
  };
}

// export function mapChannels(nInputs: number, nOutputs: 6) {
//   var ac = new AudioContext();

//   ac.decodeAudioData(ab, function (data) {
//     var source = ac.createBufferSource();
//     source.buffer = data;
//     var splitter = ac.createChannelSplitter(2);
//     source.connect(splitter);
//     var merger = ac.createChannelMerger(2);

//     // Reduce the volume of the left channel only
//     var gainNode = ac.createGain();
//     gainNode.gain.setValueAtTime(0.5, ac.currentTime);
//     splitter.connect(gainNode, 0);

//     // Connect the splitter back to the second input of the merger: we
//     // effectively swap the channels, here, reversing the stereo image.
//     gainNode.connect(merger, 0, 1);
//     splitter.connect(merger, 1, 0);

//     var dest = ac.createMediaStreamDestination();

//     // Because we have used a ChannelMergerNode, we now have a stereo
//     // MediaStream we can use to pipe the Web Audio graph to WebRTC,
//     // MediaRecorder, etc.
//     merger.connect(dest);
//   });
// }

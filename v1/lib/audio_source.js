function PlayableAudioSource(ctx) {
  const TYPE_AUDIO_TAG = 1;
  const TYPE_MIC_PHONE = 1;
  const TYPE_SRC_URL = 3;
  const TYPE_WAVE_FORM = 4;
  const TYPE_WAVE_ARRAY_BUFFER = 5;


  function from() {
    switch (type) {
      case TYPE_AUDIO_TAG:
      case TYPE_MIC_PHONE:
      case TYPE_SRC_URL:
      case TYPE_WAVE_FORM:
      case TYPE_WAVE_ARRAY_BUFFER:
    }
  }

  async function getAudioDevice(deviceId) {
    if (!navigator.mediaDevices) {
      throw new Error("web rtc not available")
    }
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: deviceId, echoCancellation: true } });

      var audio = document.createElement("audio")
      audio.srcObject = stream;
      
      audio.onloadedmetadata = function (e) {
        audio.muted = true;
        audio.control = true;
        audio.play();
      };
      document.body.appendChild(audio);
      var source = ctx.createMediaStreamSource(stream);
      return source;
    } catch (e) {
      throw e;
    }
  }

  function random_noise(audioCtx) {
    // Create an empty three-second stereo buffer at the sample rate of the AudioContext
    var myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * 3, audioCtx.sampleRate);

    // Fill the buffer with white noise;
    //just random values between -1.0 and 1.0
    for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
      // This gives us the actual ArrayBuffer that contains the data
      var nowBuffering = myArrayBuffer.getChannelData(channel);
      for (var i = 0; i < myArrayBuffer.length; i++) {
        // Math.random() is in [0; 1.0]
        // audio needs to be in [-1.0; 1.0]
        nowBuffering[i] = i >> 2;

      }
    }
    var source = audioCtx.createBufferSource();
    source.loop = true;
    // set the buffer in the AudioBufferSourceNode
    source.buffer = myArrayBuffer;

    return source;
  }

 

  return {
    random_noise,
    getAudioDevice    
  }

}


export default PlayableAudioSource;

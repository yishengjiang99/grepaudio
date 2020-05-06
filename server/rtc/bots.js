const RTCConfigs = require('./RTCConfigs.js');
const express = require('express')
const bodyParser = require('body-parser');
const httpport = process.env.PORT || 4000
const wrtc = require("wrtc");
const { PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const { StreamInput, StreamOutput } = require('fluent-ffmpeg-multistream');
const { RTCAudioSink, RTCVideoSink, RTCAudioSource } = require('wrtc').nonstandard;
const WebSocket = require('ws');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ytdl = require('ytdl-core');
var BroadcasterClient =  require('./BroadcasterClient.js');

const SERVER_RTC_SERVICES = {
    mirror:{
        serverFunction: (peerConnection)=>{
            const audioTransceiver = peerConnection.addTransceiver('audio');
            const videoTransceiver = peerConnection.addTransceiver('video');
            return Promise.all([
              audioTransceiver.sender.replaceTrack(audioTransceiver.receiver.track),
              videoTransceiver.sender.replaceTrack(videoTransceiver.receiver.track)
            ]);
        }
    },
    streamer:{
        serverFunction: (peerConnection,arg1, arg2) => {
        
            console.log(" prepare for streamer "+arg1+" arg "+arg2);
            const vid = arg1;
            const format = "mp3"
            var channel = peerConnection.createDataChannel('napster');
            channel.onopen = function(){
                console.log("channel open")
                ffmpeg.setFfmpegPath(ffmpegPath);
                var input = new PassThrough();
                ytdl(vid, { audioFormat: 'mp3',filter:"audioonly"})
                .pipe(input);
                var proc = ffmpeg().addInput(input).format('mp3');

            

                proc.ondata = function(evt){
                    console.log(evt.data.toString('utf-8'));
                    console.log("ondata")
                    channel.send(evt.data);
                }
            }

            peerConnection.ondatachannel = function(evt){
                const dataChannel = evt.channel;
                console.log(dataChannel.stream);
                console.log('remote datachannel created');
                dataChannel.onopen = function(){
                    ffmpeg.setFfmpegPath(ffmpegPath);
                    const p = new PassThrough();
                    var vid = ytdl(req.params.vid, { audioFormat: 'mp3' });
                    vid.pipe(p);
                    console.log(p);
                    console.log("text tick");
                    var output = ffmpeg().addInput(p)
                    .format('mp3')
                    .pipe(new PassThrough())
                    .pipe(dataChannel.stream);
                    output.on('data',function(evt){
                        dataChannel.send(evt.data);
                    });
                }
            }      
        }
    },

    audioFilter: {
        serverFunction: function (peerConnection, param, res) {
            const audioTransceiver = peerConnection.addTransceiver('audio');
            const audioTrack = new RTCAudioSink(audioTransceiver.receiver.track);

            // const audioOutput = new RTCAudioSource();
            // const outputTrack = audioOutput.createTrack();
            audioTransceiver.sender.replaceTrack(audioTrack);
            console.log('audio filter');


            const sampleRate = audioTrack.sampleRate;;
            const bitsPerSample = 16;
            const numberOfFrames = 441800 / 100;
            const bitrate = bitsPerSample * sampleRate;
            const outputData = new Uint8Array(numberOfFrames * bitrate);
            const channelCount = 2;
            const data = {
                outputData,
                sampleRate,
                bitsPerSample,
                channelCount,
                numberOfFrames
            };

            const pipe = new PassThrough();
            var pipedToFFmpeg = false;
            var outputFormat = null;

            audioTrack.addEventListener('frame', function (data, sampleRate, bitsPerSample, channelCount, numberOfFrames) {
                console.log('onframe')
            });
            audioTrack.addEventListener('data', function (data) {
                pipe.push(Buffer.from(data.samples.buffer))
            });

            peerConnection.on("close", audioTrack.end());

            stream.proc = ffmpeg()
            .addInput((new StreamInput(pipe)).url)
            .addInputOptions([
              '-f s16le',
              '-ar 48k',
              '-ac 1',
            ])
            .on('start', ()=>{
              console.log('Start recording >> ', stream.recordPath)
            })
            .on('end', ()=>{

                console.log("record end");            //   stream.recordEnd = true;
             // console.log('Stop recording >> ', stream.recordPath)
            }).output('output.wav')
        }
    },
    radio: "SERVER_SENDING",
    sendFile: "SERVER_RECEIVING",
    tom: "SERVER_FRIEND"
}

// var bots = Object.keys(SERVER_RTC_SERVICES).map(service=>{
//     var prepareStream = SERVER_RTC_SERVICES[service].serverFunction || function(){ console.log(" svr callback for "+service)};
//     BroadcasterClient({ onEvent: console.log, prepareStream: prepareStream}).startBroadcast(service);
// });

console.log("HI");

ffmpeg.setFfmpegPath(ffmpegPath);

console.log("start dl");
var video = ytdl('https://www.youtube.com/watch?v=QpgOyWllqmc', { audioFormat: 'mp3',filter:"audioonly"});
console.log("at fffmpeg");


  const ffmpeg2 = new ffmpeg(video);
  process.nextTick(() => {
    const output = ffmpeg2.format('mp3').saveToFile("/dev/null")
  })


/*
    ffmpeg.on('err', err => {
      console.log(err);
    })
*/

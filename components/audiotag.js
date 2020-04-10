var audioTag= function(containerId) {
    
    var container = document.querySelector(containerId);

    var audio = document.createElement("audio");
    audio.onload=function(){
      audio.addEventListener("input|progress|select|play|playing|pause|loadstart|loadeddata|loadedmetadatadurationchange", function(e){
        log('player event '+e.type);
      })
    }
    var select = document.createElement("select");
    
    select.style="height:33px; vertical-align:top;"

    var noiseCancel = document.createElement("select");
    container.appendChild(select);
 
   
    var filelist = song_db.split("\n");

    select.innerHTML = filelist.map(t=>"./samples/"+t.trim())
    .map(t => `<option value=${t}>${t}</option>`).join("");

    audio.src = '/samples/song.mp3';

    select.addEventListener('input', function(e){
        audio.src = e.target.value; 
        audio.loop=true;
        audio.oncanplay = audio.play();
    });
    audio.setAttribute("data-filelist", filelist);

      
    return audio;
}



export default audioTag;
const song_db=
`Sin2000.wav
Sin4000.wav
Sin440.wav
Sin8000.wav
backwards-drink.wav
ball-ball-hard.wav
ball-ball-hard2.wav
ball-ball-light.wav
ball-ball-light2.wav
ball-ball-light3.wav
ball-ball-light4.wav
ball-ball-light5.wav
ball-ball-medium.wav
ball-ball-medium2.wav
ball-ball-medium3.wav
ball-edge-hard1.wav
ball-edge-medium1.wav
ball-edge-medium2.wav
ball-pocket-balls.wav
ball-pocket-balls2.wav
ball-pocket1.wav
ball-pocket2.wav
ball-pocket3.wav
ball-pocket4.wav
ball-rolling1.wav
ball-rolling2.wav
balls-of-the-orient.wav
bass-heartbeat.wav
bells.wav
br-jam-loop.wav
breakbeat.wav
cauldron.wav
chalk.wav
clapping-crowd.wav
conga-rhythm.wav
crunched-up-paper.wav
ethnic8.wav
filter-noise-1.wav
filter-noise-2.wav
filter-noise-3.wav
filter-noise-4.wav
filter-noise-5.wav
grunge-loop1.wav
grunge-loop2.wav
grunge-loop3.wav
guitar-chords.wav
handdrum-loop.wav
hihat-short.wav
human-voice.wav
hype-crowd.wav
j-pines-bigger-snare.wav
laughter.wav
lo-drum.wav
muted-snare.wav
o-daiko.wav
penny-spinning.wav
pinkgood.wav
rack1.wav
rack2.wav
rack3.wav
refreshing-drink.wav
screeching-car.wav
siren.wav
slit-drum-hi.wav
slit-drum-low.wav
stick-cue-hard1.wav
stick-cue-hard2.wav
stick-cue-hard3.wav
stick-cue-light1.wav
stick-cue-light2.wav
stick-cue-light3.wav
stick-cue-light4.wav
stick-cue-medium1.wav
stick-cue-medium2.wav
stick-cue-medium3.wav
stick-cue-medium4.wav
stick-cue-medium5.wav
stick-cue1.wav
ticking.wav
timbale.wav
tingly-windthing.wav
tingly-windthing2.wav
water-bowl.wav
water-glass.wav
waves.wav
white-noise-mono.wav
white-noise.wav
A0.mp3
A1.mp3
A2.mp3
A3.mp3
A4.mp3
A5.mp3
A6.mp3
A7.mp3
C1.mp3
C2.mp3
C3.mp3
C5.mp3
C6.mp3
C7.mp3
C8.mp3
Ds1.mp3
Ds2.mp3
Ds3.mp3
Ds4.mp3
Ds5.mp3
Ds6.mp3
Ds7.mp3
Fs1.mp3
Fs2.mp3
Fs3.mp3
Fs4.mp3
Fs5.mp3
Fs6.mp3
Fs7.mp3
lana.mp3
song.mp3
toxic.mp3`;
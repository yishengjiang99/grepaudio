
const scope = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",  
    "streaming",
    "app-remote-control",
    "user-library-read",
    "playlist-modify-private",

];
const AUTH_URL = "https://dsp.grepawk.com/api/spotify/login";
const API_DIR = "https://api.spotify.com/v1";
const el = React.createElement;
let authToken;

const fetchAPI = (uri,method="GET") => fetch(API_DIR + uri, {
    method: method, headers: {"Content-Type": "application/json", "Authorization": "Bearer " + authToken}
}).catch(err=>{ log(err) });

const fetchAPIPut = (uri, body) =>  fetch(API_DIR+uri,{
    method:"PUT",
    body: JSON.stringify(body),
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
});

const $=(s)=>document.querySelector(s);
export const checkAuth = function ({containerId}) {
    let element;
    const token = location.hash && location.hash.match(/access_token\=(.*?)\&/)[0].replace("access_token=", "");
    authToken = token;
    if (!token) {
        element = el("button", {
            onClick: () => document.location = AUTH_URL + "?scope=" + scope.join(",") + "&jshost=" + document.location.hostname
        }, "Login With Spotify")
        ReactDOM.render(element, document.getElementById(containerId));
    } else {
        element = el("span", {
            className: "welcome"
        }, "Welcome ");
        ReactDOM.render(element, document.getElementById(containerId));
        loadSpotifyPremium(token);
        return token;
    }
};

export const getPlayList = async (token, containerId) => {

    const playlistJson = await fetchAPI("/me/playlists").then(res => res.json());
    const playlist = playlistJson.items;
    ReactDOM.render(el("ul",
        {list: playlist},
        playlist.map(item => {
            return el("li", {
                key: item.id,
                onClick: () => getTracks(token, item.id, 'tracklist'),
                onTouchMove: () => getTracks(token, item.id, 'tracklist')
            }, item.name + " | " + item.id);
        })
    ), document.getElementById(containerId));


    if(playlist.length>0) getTracks(token, playlist[0].id, 'tracklist')
}


/*
"*/


const trackRow = (item) =>{
    return el('li', {}, [
        el('span',null, item.track.name),
        el('button', {
            onClick: ()=>playTrack(item.track.id)
        }, 'play'),
        el('button', {
            onClick: ()=>queueTrack(item.track.id)
        }, 'queue')
    ])
}
export const getTracks = async function (token, playlistId, containerId) {
    const trackListJson = await fetchAPI("/playlists/" + playlistId + "/tracks").then(res => res.json());
    const trackList = trackListJson.items;
    ReactDOM.render(el("ul",
        {list: trackList},
        trackList.map(item => trackRow(item))
    ), document.getElementById(containerId));
}

function loadSpotifyPremium(token){
    if(window.webplayer && window.spotifyDeviceId) return window.webplayer;

    return new Promise((resolve,reject)=>{
      
        window.onSpotifyWebPlaybackSDKReady = () => {
            log("loading")
            window.webplayer = new Spotify.Player({
                name: "Web Playback SDK Quick Start Player",
                getOAuthToken: cb => cb(token)
            });
            window.webplayer.addListener("initialization_error", ({message}) => {
                log(message)
            });
            window.webplayer.addListener("not_ready", (e) => {
                log('not read')
            });

            window.webplayer.addListener("ready", (e) => {
                log('ready')
                window.spotifyDeviceId = e.device_id;
                document.getElementById("play").style.display='block';
                const controls ={
                    play: $("#play"),
                    stop: $("#stop"),
                    rewind: $("#rewind"),
                    ff: $("#forward")
                }
            
                window.webplayer.addListener("initialization_error", e=> reject(e));
                window.webplayer.addListener("account_error", (e)=>log('account not prenium') && reject(e));
                window.webplayer.connect();
                controls.play.onclick = () =>window.webplayer.resume();
                controls.stop.onclick = () =>window.webplayer.pause();
                controls.ff.onclick = () =>window.webplayer.nextTrack();
                controls.rewind.onclick = () =>window.webplayer.previousTrack()

                resolve();
            });
            window.webplayer.addListener("player_state_changed", e=>{
                console.log(e)
                if(e.track_window.current_track){
                    $(".song-name").innerHTML = e.track_window.current_track.name;
                    $(".song-thumbnail").src = e.track_window.current_track.album.images[0].url;
                    $(".artist-name").innerHTML = e.track_window.current_track.artists.map(a=>a.name).join(", ")
                }
                let timer;
            
                if(e.paused === false){
                    if(timer) cancelAnimationFrame(timer);
                    var startedAt = e.position;
                    var start = new Date();
                    const positionUI = $("#player .position");
                    const durationUI = $("#player .duration");
                
                    const progress = document.getElementById("progress")
                    durationUI.innerHTML = ms_to_mm_ss(e.duration);
                    progress.max = e.duration;
                    function updateTimer(){
                        var elapsed = new Date().getTime() - start.getTime();
                        positionUI.innerHTML = ms_to_mm_ss(e.position+elapsed);
                        var played = startedAt + elapsed;
                        progress.value = played;
                        timer=requestAnimationFrame(updateTimer);
                    }
                    
                    updateTimer();

                }
            })
            window.webplayer.connect();
        }

        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://sdk.scdn.co/spotify-player.js";
        document.getElementsByTagName("head")[0].appendChild(script);
    });
}

export const playTrack = async function (trackId){
    
    await loadSpotifyPremium(authToken);
    fetchAPIPut("/me/player/play?device_id="+window.spotifyDeviceId, {uris: ['spotify:track:'+trackId]})
    .then(resp=>{
        log(resp) //"loaded")
    }).catch(e=>{
        log(e);
    });    
}
export const queueTrack = async function (trackId){
    await loadSpotifyPremium(authToken);
    fetchAPI("/me/player/queue?uri=spotify:track:"+trackId,"POST")

}
Number.prototype.lpad = function (n,str) {
    return (this < 0 ? '-' : '') + 
            Array(n-String(Math.abs(this)).length+1)
             .join(str||'0') + 
           (Math.abs(this));
}
function ms_to_mm_ss(ms){
    const secondst = ms/1000;
    const minutes = ~~(secondst / 60);
    const seconds = Math.floor(secondst - minutes*60);
    
    return `${minutes<10? '0'+minutes : minutes} : ${seconds<10? '0'+seconds : seconds}`;
}
function log(msg){
    if(typeof msg ==='object'){
        log( JSON.stringify(msg, null, '\t'));
        return; 
    }


    document.getElementById("debug").innerHTML = msg;
}


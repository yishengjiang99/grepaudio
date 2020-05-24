const scope = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming",
    "app-remote-control",
];
const AUTH_URL = "https://dsp.grepawk.com/api/spotify/login";
const API_DIR = "https://api.spotify.com/v1";

const fetchAPI = (uri, token, method = 'GET') => fetch(API_DIR + uri, {
    method: "GET", headers: {"Content-Type": "application/json", "Authorization": "Bearer " + token}
});
const $=(s)=>document.querySelector(s);
export const checkAuth = function ({containerId}) {
    let element;
    const token = location.hash && location.hash.match(/access_token\=(.*?)\&/)[0].replace("access_token=", "");
    if (!token) {
        element = React.createElement("button", {
            onClick: () => document.location = AUTH_URL + "?scope=" + scope.join(",") + "&jshost=" + document.location.hostname
        }, "Login With Spotify")
        ReactDOM.render(element, document.getElementById(containerId));
    } else {
        element = React.createElement("span", {
            className: "welcome"
        }, "Welcome ");
        ReactDOM.render(element, document.getElementById(containerId));
        loadSpotifyPremium(token);
        return token;
    }
};

export const getPlayList = async (token, containerId) => {

    const playlistJson = await fetchAPI("/me/playlists", token).then(res => res.json());
    const playlist = playlistJson.items;
    ReactDOM.render(React.createElement("ul",
        {list: playlist},
        playlist.map(item => {
            return React.createElement("li", {
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
const sampleTrck = {"album": {"album_type": "album", "artists": [{"external_urls": {"spotify": "https://open.spotify.com/artist/00FQb4jTyendYWaN8pK0wa"}, "href": "https://api.spotify.com/v1/artists/00FQb4jTyendYWaN8pK0wa", "id": "00FQb4jTyendYWaN8pK0wa", "name": "Lana Del Rey", "type": "artist", "uri": "spotify:artist:00FQb4jTyendYWaN8pK0wa"}], "available_markets": ["CA", "CR", "MX", "US"], "external_urls": {"spotify": "https://open.spotify.com/album/5PW8nAtvf2HV8RYZFd4IrX"}, "href": "https://api.spotify.com/v1/albums/5PW8nAtvf2HV8RYZFd4IrX", "id": "5PW8nAtvf2HV8RYZFd4IrX", "images": [{"height": 640, "url": "https://i.scdn.co/image/ab67616d0000b273cb76604d9c5963544cf5be64", "width": 640}, {"height": 300, "url": "https://i.scdn.co/image/ab67616d00001e02cb76604d9c5963544cf5be64", "width": 300}, {"height": 64, "url": "https://i.scdn.co/image/ab67616d00004851cb76604d9c5963544cf5be64", "width": 64}], "name": "Born To Die - The Paradise Edition", "release_date": "2012-11-12", "release_date_precision": "day", "total_tracks": 23, "type": "album", "uri": "spotify:album:5PW8nAtvf2HV8RYZFd4IrX"}, "artists": [{"external_urls": {"spotify": "https://open.spotify.com/artist/00FQb4jTyendYWaN8pK0wa"}, "href": "https://api.spotify.com/v1/artists/00FQb4jTyendYWaN8pK0wa", "id": "00FQb4jTyendYWaN8pK0wa", "name": "Lana Del Rey", "type": "artist", "uri": "spotify:artist:00FQb4jTyendYWaN8pK0wa"}], "available_markets": ["CA", "CR", "MX", "US"], "disc_number": 1, "duration_ms": 230520, "episode": false, "explicit": false, "external_ids": {"isrc": "GBUM71111567"}, "external_urls": {"spotify": "https://open.spotify.com/track/1M0g1beKC4H9gbrOiSayHW"}, "href": "https://api.spotify.com/v1/tracks/1M0g1beKC4H9gbrOiSayHW", "id": "1M0g1beKC4H9gbrOiSayHW", "is_local": false, "name": "National Anthem", "popularity": 59, "preview_url": "https://p.scdn.co/mp3-preview/4d18f55dbbd684757dcd4b4064ba63b36c3ba040?cid=3993d63f6507434d9ec90cc704b435d9", "track": true, "track_number": 6, "type": "track", "uri": "spotify:track:1M0g1beKC4H9gbrOiSayHW"}
export const getTracks = async function (token, playlistId, containerId) {
    const trackListJson = await fetchAPI("/playlists/" + playlistId + "/tracks", token).then(res => res.json());
    const trackList = trackListJson.items;
    ReactDOM.render(React.createElement("ul",
        {list: trackList},
        trackList.map(item => {
            return React.createElement("li", {
                onClick: function () {
                    playTrack(token, item.track.id, 'player-panel');
                }
            },item.track.name);
        })
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
                    ff: $("#rewind")
                }
                window.webplayer.addListener("initialization_error", e=> reject(e));
                window.webplayer.addListener("account_error", (e)=>log('account not prenium') && reject(e));
                window.webplayer.connect();
    
                controls.play.onclick = () =>window.webplayer.resume();
                controls.stop.onclick = () =>window.webplayer.pause();
                resolve();
            });
            window.webplayer.addListener("player_state_changed", e=>{
 const s = {
     context: {uri: null, metadata: {}},
     bitrate: 0,
     position: 0,
     duration: 229087,
     paused: false,
     shuffle: false,
     repeat_mode: 0,
     track_window: {
         current_track: {
             id: "1gewemPOUilb21s7CfMS55",
             uri: "spotify:track:1gewemPOUilb21s7CfMS55",
             type: "track",
             linked_from_uri: null,
             linked_from: {uri: null, id: null},
             media_type: "audio",
             name: "Bartender Song (Sittin' At A Bar) - Alt/Rock Mix",
             duration_ms: 229087,
             artists: [{name: "Rehab", uri: "spotify:artist:1qh1aHXy7LRcb7eyriuJTS"}],
             album: {
                 uri: "spotify:album:39GmYuRp42zXVjzCLffcOC",
                 name: "Graffiti The World",
                 images: [
                     {
                         url: "https://i.scdn.co/image/ab67616d00001e02849e5870ecd098e9996688a0",
                         height: 300,
                         width: 300,
                     },
                     {
                         url: "https://i.scdn.co/image/ab67616d00004851849e5870ecd098e9996688a0",
                         height: 64,
                         width: 64,
                     },
                     {
                         url: "https://i.scdn.co/image/ab67616d0000b273849e5870ecd098e9996688a0",
                         height: 640,
                         width: 640,
                     },
                 ],
             },
             is_playable: true,
         },
         next_tracks: [],
         previous_tracks: [],
     },
     timestamp: 1590335791631,
     restrictions: {
         disallow_resuming_reasons: ["not_paused"],
         disallow_skipping_prev_reasons: ["no_prev_track"],
     },
     disallows: {resuming: true, skipping_prev: true},
 };

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

export const playTrack = async function (token, trackId, containerId){
    await loadSpotifyPremium(token);
    fetch(API_DIR+"/me/player/play?device_id="+window.spotifyDeviceId,{
        method:"PUT",
        body: JSON.stringify({ uris: ['spotify:track:'+trackId] }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    
}
function ms_to_mm_ss(ms){
  return `${ ~~(ms / 60000)}:${~~(ms / 1000)}`; //  ~~(elapsed / 60000) "+" ~~(elapsed) / 1000;
}
function log(msg){
    if(typeof msg ==='object'){
        log( JSON.stringify(msg, null, '\t'));
        return; 
    }
    document.getElementById("debug").innerHTML = msg;
}


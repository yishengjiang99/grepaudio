/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";

const loadJS = (src) => {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = src;
  document.getElementsByTagName("head")[0].appendChild(script);
};

const initialState = {
  loaded: false,
  currentTrack: null,
  nextTrack: null,
  canFF: false,
  canRewind: false,
  canPlay: false,
  queue: [],
  playbackTime: 0,
  playerbackDuration: 0,
};

export const SpotifyPremium = ({ authToken }) => {
  const [webPlayer, setWebPlayer] = useState(null);
  const [playerState, setPlayerState] = useState(initialState);

  useEffect(() => {
    async function loadWebSDK() {
      return new Promise((resolve, reject) => {
        window.onSpotifyWebPlaybackSDKReady = () => {
          window.webplayer = new Spotify.Player({
            name: "webapp",
            getOAuthToken: (cb) => cb(authToken),
          });
          window.webplayer.addListener("initialization_error", reject);
          window.webplayer.addListener("not_ready", reject);
          window.webplayer.addListener("ready", (e) =>
            Promise.resolve(window.webplayer)
          );
          window.webplayer.addListener("player_state_changed", (e) =>
            setPlayerState(e)
          );
        };
        loadJS("https://sdk.scdn.co/spotify-player.js");
      });
    }

    if (authToken && !webPlayer) {
      loadWebSDK(authToken).then((_player) => setWebPlayer(_player));
    }
  }, [webPlayer, authToken]);

  return (
    <div>
      <span>{JSON.stringify(playerState)}</span>
    </div>
  );
};

const useWebPlayer = (webPlayer) => {
  const initialState = {
    loaded: false,
    currentTrack: null,
    nextTrack: null,
    canFF: false,
    canRewind: false,
    canPlay: false,
    queue: [],
    playbackSeek: 0,
    playerbackDuration: 0,
  };
  const reducer = (state, action) => {
    const opts = {
      resume: webplayer.resume(),
      pause: webplayer.pause(),
      nextTrack: webplayer.nextTrack(),
      previousTrack: webplayer.previousTrack(),
    };
  };

  window.webplayer.connect();

  const [webPlayerState, webPlayerDispatch] = useReducer(reducer, initialState);
  const webplayerActors = (type, track) => webPlayerDispatch({ type, track });
  return [webPlayerState, webplayerActors];
};

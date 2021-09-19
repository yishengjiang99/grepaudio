if (!window) throw new Exception("no");

import React, {
  useState,
  useEffect,
  createElement,
  useReducer,
  useRef,
} from "react";
import {
  Badge,
  Avatar,
  AppBar,
  ListItemAvatar,
  ListItem,
  List,
  ListItemText,
  Typography,
} from "@material-ui/core";

import { SpotifyPremium } from "./premium";
import { MediaListGrid, MediaCard, InlineText } from "./util-components";
process.env.spotify_client_id = "3993d63f6507434d9ec90cc704b435d9";
const fetchAPI = (uri) =>
  fetch("https://api.spotify.com/v1/" + uri, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authToken,
    },
  })
    .then((resp) => resp.json())
    .catch((e) => alert(e.message));
export const SpotifyPlayer = () => {
  const [auth, setAuth] = useState(null);
  const [you, setYou] = useState(null);
  const [sdk, setSdk] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [playLists, setPlayLists] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const authToken = auth;

  useEffect(() => {
    if (window) {
      var hash = window && window.location.hash.substring(1);
      postDebug("got wind");

      var params = {};
      hash.split("&").map((hk) => {
        let temp = hk.split("=");
        params[temp[0]] = temp[1];
      });
      if (params["access_token"]) {
        postDebug("got act");

        setAuth(params["access_token"]);

        setSdk(APIs(params["access_token"]));
      }
    }
  }, []);

  useEffect(() => {
    if (sdk) {
      sdk.onEvent("auth_expired", () => setAuth(null));

      const { getTracks, getPlayLists, fetchAPI } = sdk;

      getTracks().then((_tracks) => setTracks(_tracks));
      getPlayLists().then((_playlists) => setPlayLists(_playlists));
      fetchAPI("/me")
        .then((resp) => resp.json())
        .then((profile) => {
          profile && setYou(profile);
        });
    }
  }, [sdk, auth]);
  return (
    <>
      <AppBar>
        <Typography>Hello</Typography>
        {auth ? (
          <Profile profile={you} />
        ) : (
          <LoginBtn loginUrl={loginUrl("3993d63f6507434d9ec90cc704b435d9")} />
        )}
      </AppBar>
      <div>{debugMsgs.lastMessage}</div>
      <ColGridOneThree>
        <List>
          {playLists.map((p) => (
            <PlayListItem item={p}></PlayListItem>
          ))}
        </List>
        <MediaListGrid>
          {tracks.map((track) => (
            <TrackItem track={track} />
          ))}
        </MediaListGrid>
      </ColGridOneThree>
      <SpotifyPremium authToken={authToken}></SpotifyPremium>
      <NowPlaying nowPlaying={currentTrack}></NowPlaying>
      <DebugConsole />
    </>
  );
};

ReactDOM.render(
  React.createElement(<SpotifyPlayer />, document.getElementById("js-root"))
);

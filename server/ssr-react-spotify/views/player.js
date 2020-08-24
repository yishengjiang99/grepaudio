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
import { useChannel } from "./useChannel";
import { APIs, loginUrl } from "./APIs";
import { SpotifyPremium } from "./premium";
import {
  DebugConsole,
  ColGridOneThree,
  MediaListGrid,
  MediaCard,
} from "./util-components";
process.env.spotify_client_id = "3993d63f6507434d9ec90cc704b435d9";

export const SpotifyPlayer = () => {
  const [debugMsgs, postDebug] = useChannel("debug");
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

export const Profile = ({ profile }) => (
  <React.Fragment>
    <InlineText>{(profile && profile.display_name) || "loading.."}</InlineText>
    <Badge badgeContent={profile && profile.display_name}>
      <Avatar alt={profile.display_name} src={profile.images[0].url} />
    </Badge>
  </React.Fragment>
);

export interface TrackItemProps {
  name: string;
  description: string;
  id: string;
  artist: string;
  imageURL: string;
  duration_ms: Number;
}
export const trackItemFromJson = (json) => {
  if (json.type !== "track") return false;
  const props: TrackItemProps = {
    name: json.name,
    id: json.id,
    uri: json.uri,
    imageURL: json.album.images[0].url,
    description: json.album.name,
    artist: json.artists[0].name,
    preview: json.preview_url,
    albumId: json.album.id,
  };
  return createElement(TrackItem, props, []);
};

export const TrackItem = (props: TrackItemProps) => {
  const { name, description, id, artist, imageURL } = props;
  const elemProps: MediaCardProps = {
    name: name,
    description: description,
    imageUrl: imageURL,
    subtext: artist,
    onClick: (evet) => {},
    onClickText: "play",
  };
  return createElement(MediaCard, elemProps);
};

export interface PlayListItemProps {
  name: string;
  imageURL: string;
  description: string;
  onClick: (e) => void;
}
export const mapJsonToPlayListItem = (json: any) => {
  const props: PlayListItemProps = {
    name: json.name,
    id: json.id,
    imageURL: json.album.images[0].url,
    description:
      json.album.name + " " + json.artists.map((a) => a.name).join(" "),
    onClick: (e) => {
      SDK, queue(json.id);
    },
  };
  return props;
};
export const PlayListItem = (props: PlayListProps) => (
  <ListItem alignItems="flex-start">
    <ListItemAvatar>
      <Avatar alt={item.name} src={imageUrl} />
    </ListItemAvatar>
    <ListItemText
      primary={item.name}
      secondary={
        <InlineText texts={[item.description, item.description]}> </InlineText>
      }
    />
  </ListItem>
);

export const NavBarTop = ({ dataSrc, you }) => {
  useEffect(() => {
    if (dataSrc && !you) {
      fetch(dataSrc).then((resp) => resp.json());
    }
  }, [dataSrc, you]);
  return (
    <AppBar>
      <InlineText>Hello</InlineText>
      <Profile profile={you} />
    </AppBar>
  );
};
export const NowPlaying = ({ track, artists }) => (
  <div>
    <img src={track && track.album.images[0].url} alt={track && track.name} />
    {artists && artists.map((a) => a.name).join(" ")}
  </div>
);

"use strict";
import { stringify } from "querystring";
import { url } from "inspector";
import {
  MediaCardProps,
  MediaCard,
  InlineText,
  ToolPanel,
  MediaListGrid,
} from "./util-components";

import { createElement, Fragment } from "react";
import {
  Badge,
  Avatar,
  AppBar,
  ListItemAvatar,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";

export const Profile = ({ profile }) => (
  <Badge badgeContent={profile && profile.display_name}>
    <Avatar alt={profile.display_name} src={profile.images[0].url} />
  </Badge>
);
interface IMainPanelProp {
  children: any;
}
export const MainPanel = (props: IMainPanelProp) => {
  <MediaListGrid>{props.children}</MediaListGrid>;
};

export interface TrackItemProps {
  name: string;
  description: string;
  id: string;
  artist: string;
  imageURL: string;
}
export const trackItemFromJson = (json) => {
  if (json.type !== "track") return false;
  const props: TrackItemProps = {
    name: json.name,
    id: json.id,
    imageURL: (
      json.album.images[2] ||
      json.album.images[1] ||
      json.album.images[0]
    ).url,
    description: json.album.name,
    artist: json.artists[0].name,
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

export const PlayListItem = ({ item }) => (
  <ListItem alignItems="flex-start">
    <ListItemAvatar>
      <Avatar alt={item.name} src={item.images[0].url} />
    </ListItemAvatar>
    <ListItemText primary={item.name} secondary={item.description} />
  </ListItem>
);

export const NavBarTop = ({ dataSrc, you }) => {
  return (
    <AppBar>
      <InlineText text={"Hello"} subText={""}></InlineText>
      <Profile profile={you} />
    </AppBar>
  );
};
export const NowPlaying = (trackProp: TrackItemProps) => {
  const { name, description, id, artist, imageURL } = trackProp;
  return (
    <div>
      <img src={imageURL} alt={name} />
      {artist}
      <ToolPanel />
    </div>
  );
};

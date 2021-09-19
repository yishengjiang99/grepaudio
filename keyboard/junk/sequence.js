import styles from "./sequence.module.css";
import React from "react";
import {
  FastRewind,
  FastForward,
  PlayCircleFilledSharp,
  PauseCircleFilledSharp,
} from "@material-ui/icons";
import { trackReducer, initialState } from "../lib/trackstore";
import { IconButton, Toolbar } from "@material-ui/core";
import { useState, useEffect, useRef, useReducer } from "react";
const notes = [
  1,
  261.63,
  277.18,
  293.66,
  311.13,
  329.63,
  349.23,
  369.99,
  392,
  415.3,
  440,
  466.16,
  493.88,
];
const PlaybackStateEnum = {
  initial: 0,
  recording: 1,
  paused: 2,
  playing: 3,
  ended: 4,
};

const Sequence = ({ cols, rows, currentBar, bitmap, trackDispatch }) => {
  const [msg, setMsg] = useState("");
  const [playbackState, setPlaybackState] = useState(0);

  const pushNote = (note, currentBar) => {
    if (playbackState === PlaybackStateEnum.playing) {
      setMsg("cannot push note during playback");
      return;
    }
    bitmap[currentBar] = bitmap[currentBar] | (1 << notes.indexOf(note));
  };

  const LE_MASKS = [
    0x01,
    0x02,
    0x04,
    0x0f,
    0x1f,
    0x2f,
    0x4f,
    0xff,
    0x101,
    0x102,
    0x104,
    0x10f,
    0x11f,
    0x12f,
    0x14f,
    0x1ff,
  ];
  const LE_SHIFT = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const isLit = (bar, noteIndex) => {
    if (bar > bitmap.lenght) return false;
    else return (bitmap[bar] & LE_MASKS[noteIndex]) >> LE_SHIFT[noteIndex];
  };
  const playback = () => {
    window.postMessage({
      evt: "playTrack",
      source: "sequence",
    });
    setPlaybackState(PlaybackStateEnum.playing);
  };
  const grids = [];
  for (let j = 0; j < cols; j++) {
    for (let i = rows - 1; i >= 0; i--) {
      const isBarLit = isLit(i, j);
      const className = isBarLit
        ? `${styles.gridItem} ${styles.noteOn}`
        : styles.gridItem;

      grids.push(
        <div
          onClick={() =>
            trackDispatch({
              source: "sequence",
              type: "toggleBitmap",
              noteIndex: i,
              bar: j,
            })
          }
          key={j * cols + i}
          className={className}
        ></div>
      );
    }
  }
  return (
    <>
      <Toolbar>
        <IconButton
          onClick={() => trackDispatch({ source: "sequencer", type: "rewind" })}
        >
          <FastRewind />
        </IconButton>
        {playbackState === PlaybackStateEnum.playing ? (
          <IconButton
            onClick={() =>
              trackDispatch({ source: "sequencer", type: "pause" })
            }
          >
            <PauseCircleFilledSharp />
          </IconButton>
        ) : (
          <IconButton onClick={() => playback()}>
            <PlayCircleFilledSharp />
          </IconButton>
        )}
        <IconButton
          onClick={() => trackDispatch({ source: "sequencer", type: "ff" })}
        >
          <FastForward />
        </IconButton>
      </Toolbar>

      <div className="hud">
        {/* <input
          type="number"
          aria-label="bpm"
          value={trackState.bpm}
          onChange={(e, v) => {
            trackDispatch({ source: "sequencer", type: "bpm", value: v });
          }}
        /> */}
        | {currentBar} bars
        <br />
        {currentBar > 0 && bitmap[currentBar - 1].toString(2)} <br />
        {bitmap[currentBar].toString(2)}
      </div>
      <div className={styles.gridContainer}>{grids}</div>
    </>
  );
};
function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}
export default Sequence;

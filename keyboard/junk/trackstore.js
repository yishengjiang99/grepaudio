/* eslint-disable no-case-declarations */
import {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
} from "react";

export const beats_per_page = 30;

export const initialState = {
  events: [],
  activeNotes: 0x0000,
  bar: 0,
  page: 0,
  isPlaying: false,
  bpm: 120,
  sequenceStart: 0,
  lastEvent: null,
  bitmap: new Uint16Array(beats_per_page),
};
export const defaultSettings = {
  envelope: {
    attack: 0.1,
    decay: 0.1,
    sustain: 0.1,
    release: 0.1, //0.01
  },
  volume: {
    min: 0,
    max: 1,
  },
};

export const trackReducer = (state, action) => {
  switch (action.type) {
    case "hold":
    case "release":
      return {
        event: state.events.concat([action]),
      };
    case "trigger":
      var bitmap = state.bitmap;
      const page = state.bar >= beats_per_page ? state.page + 1 : state.page;
      const bar = state.bar >= beats_per_page ? 0 : state.bar + 1;
      if (action.type === "trigger") {
        bitmap[bar] |= 1 << action.noteIndex;
      }
      return {
        ...state,
        bitmap,
        page,
        bar,
      };
    default:
      return state;
  }
};

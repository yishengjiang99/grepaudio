// import {
//   TrackEntity,
//   PlaylistEntity,
//   UserEntity,
//   AlbumEntity,
// } from "./thirdparty";

// // const APIs = function (_authToken) {
// //   const authToken = _authToken;
// //   // const debugChannel = new BroadcastChannel("debug");
// //   const eventhandlers = {};

// //   const onError = console.error;
// //   const onEvent = (event, handler) => {
// //     eventhandlers[event] = handler;
// //   };
// //   const searchTracks = (query) => {
// //     const tracks = [];
// //     return tracks;
// //   };
// //   const playTrack = async function (track) {
// //     fetchAPIPut("/me/player/play?device_id=", {
// //       uris: ["spotify:track:" + track.id],
// //     })
// //       .then((json) => postMessage("play track " + track.name))
// //       .catch(onError);
// //   };
// //   const getTracks = () => fetchAPIJSONItems("/me/top/artists").catch(onError);

// //   const getPlayLists = () => fetchAPIJSONItems("/me/playlists").catch(onError);

// //   const API_DIR = "https://api.spotify.com/v1";
// //   const fetchAPI = (uri, method = "GET") => {
// //     require("https").get(API_URL+uri, {
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: "Bearer " + authToken,
// //       },(res: http.IncomingMessage)=>{

// //       }

// //   });
// //     return new Promise((resolve, reject) => {
// //       Axios.get(
// //         API_DIR + uri,
// //         {
// //           headers: {
// //             "Content-Type": "application/json",
// //             Authorization: "Bearer " + authToken,
// //           },
// //         },(res)=>{
// //           resolve(res);
// //         });
// //       );
// //     });
// //   };
// //   const Transform = require("stream").Transform;

// //   const xform = new Transform({
// //     writableObjectMode:true,

// //   });

// //   const fetchAPIJSONItems = (uri, Pojo = null) =>
// //     fetchAPI(uri, "GET")
// //       .then((readable) => {

// //         return resp.json();
// //       })
// //       .then((json) => json.items)
// //       .catch((e) => onError(e, "auth error"));

// //   const fetchAPIPut = (uri, body) =>
// //     fetch(API_DIR + uri, {
// //       method: "PUT",
// //       body: JSON.stringify(body),
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: `Bearer ${authToken}`,
// //       },
// //     });
// //   return {
// //     onEvent,
// //     searchTracks,
// //     playTrack,
// //     getPlayLists,
// //     getTracks,
// //     fetchAPIPut,
// //     fetchAPI,
// //   };
// // };

// // export const APIs = function (_authToken) {
// //   const authToken = _authToken;
// //   const debugChannel = new BroadcastChannel("debug");
// //   const eventhandlers = {};

// //   const onError = (e, msg = "") => {
// //     debugChannel.postMessage("SDK spotify" + msg || e.msg || "error" + this.caller);
// //   };
// //   const onEvent = (event, handler) => {
// //     eventhandlers[event] = handler;
// //   };
// //   const searchTracks = (query) => {
// //     const tracks = [];
// //     ["/v1/search?type=track", "/v1/search?type=artist"].map((uri) => {
// //       fetchAPIJSONItems(uri, TrackEntity).then((json) => {
// //         Promise.join(json.items, (items) => tracks.concat(items));
// //       });
// //     });
// //   };

// //   const playTrack = async function (track) {
// //     fetchAPIPut("/me/player/play?device_id=" + window.spotifyDeviceId, {
// //       uris: ["spotify:track:" + track.id],
// //     })
// //       .then((json) => postMessage("play track " + track.name))
// //       .catch(onError);
// //   };
// //   const getTracks = () =>
// //     fetchAPIJSONItems("/me/top/tracks".TrackEntity.constructor)
// //       .then((json) => json.items)
// //       .then((tracksJson) => tracksJson.map((t) => new TrackEntity(t)))
// //       .catch(onError);

// //   const getPlayLists = () => fetchAPIJSONItems("/me/playlists", PlaylistEntity).catch(onError);

// //   const API_DIR = "https://api.spotify.com/v1";
// //   const fetchAPI = (uri, method = "GET") =>
// //     fetch(API_DIR + uri, {
// //       method: method,
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: "Bearer " + authToken,
// //       },
// //     });

// //   const fetchAPIJSONItems = (uri, Pojo = null) =>
// //     fetchAPI(uri, "GET")
// //       .then((resp) => {
// //         if (resp.status === 401) {
// //           eventhandlers["auth_expired"] && eventhandlers["auth_expired"]();
// //           return [];
// //         }
// //         return resp.json();
// //       })
// //       .then((json) => json.items)
// //       .then((items) => {
// //         return Pojo ? items.map((x) => Pojo(x)) : items;
// //       })
// //       .catch((e) => onError(e, "auth error"));

// //   const fetchAPIPut = (uri, body) =>
// //     fetch(API_DIR + uri, {
// //       method: "PUT",
// //       body: JSON.stringify(body),
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: `Bearer ${authToken}`,
// //       },
// //     });
// //   return {
// //     onEvent,
// //     searchTracks,
// //     playTrack,
// //     getPlayLists,
// //     getTracks,
// //     fetchAPIPut,
// //     fetchAPI,
// //   };
// // };

// // export const loginUrl = () => {
// //   const spotify_client_id = "3993d63f6507434d9ec90cc704b435d9";

// //   const scope = [
// //     "user-read-email",
// //     "user-read-playback-state",
// //     "user-modify-playback-state",
// //     "user-read-currently-playing",
// //     "streaming",
// //     "app-remote-control",
// //     "user-library-read",
// //     "playlist-modify-private",
// //   ];
// //   const redirect = "http://localhost:3000/playback";
// //   return (
// //     `https://accounts.spotify.com/authorize?client_id=${spotify_client_id}` +
// //     `&scope=${scope.join(",")}&response_type=token&redirect_uri=${encodeURIComponent(redirect)}`
// //   );
// // };

// // export const hashParams = function () {
// //   if (!window) return null;
// //   var params = {};

// //   var hash = window && window.location.hash && window.location.hash.substring(1);
// //   hash.split("&").map((hk) => {
// //     let temp = hk.split("=");
// //     params[temp[0]] = temp[1];
// //   });
// //   return params;
// // };

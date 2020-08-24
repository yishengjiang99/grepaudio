import register from "@babel/register";
import { ParseJson, RenderReact } from "./src/fetch-render-react";
import { readFileSync } from "fs";
import { trackItemFromJson, mapJsonToPlayListItem } from "./views/player";
import { createElement } from "react";
import { exec, ExecException, spawn } from "child_process";
import { Readable } from "stream";
const express = require("express");

const app = express();
const router = express.Router();

const init_ssr = function () {
  register({
    presets: [
      "@babel/preset-typescript",
      "@babel/preset-react",
      "@babel/preset-env",
    ],
  });
  const inlineFiles = {
    critcss: readFileSync("./views/critcss.html"),
    inlinejs: readFileSync("./views/inline-react.html"),
    loadBrowserJs: readFileSync("./views/browser.js"),
  };
  const { PlayListItem, TrackItem, MediaCard } = require("./views/player");
  const { renderToString } = require("react-dom/server");

  let access_token: any;
  const setAuth = (auth) => {
    access_token = auth.access_token;
  };

  return {
    setAuth: setAuth,
    critcss: inlineFiles.critcss,
    inlinejs: inlineFiles.inlinejs,
    ssr1: async (httpResponse: any, auth: { access_token: any }) => {
      let res = httpResponse;
      require("https").get(
        "https://api.spotify.com/v1/me/top/artists",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.access_token}`,
          },
        },
        (readstream: Readable) => {
          readstream
            .pipe(new ParseJson())
            .pipe(renderToString(new RenderReact(trackItemFromJson)))
            .on("data", (d) => res.write(d.toString()));

          readstream.on("end", () => Promise.resolve());
        }
      );
    },
    ssr2: (httpResponse: any, auth: { access_token: any }) => {
      require("https").get(
        "https://api.spotify.com/v1/me/playlists",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.access_token}`,
          },
        },

        (writable: Readable) => {
          request
            .pipe(new ParseJson())
            .pipe(new RenderReact(trackItemFromJson))
            .pipe(writable);

          writable.on("end", function end() {
            console.log("done");
          });
        }
      );
    },

    sendBrowserJs: (res: { write: (arg0: string) => void }) => {
      res.write(`<script>
      localStorage.set("authToken", '${access_token}')`);
      res.write(inlineFiles.loadBrowserJs.toString());
      res.write(`</script>`);
    },
    footer: `
    </body>
  </html>`,
  };
};
/* this is done once at server start, so limit performance concern*/
const ssr_steps = init_ssr();

router.get("/", async function (
  req: { query: { access_token: any; expiry?: any; refresh_token?: any } },
  res: { redirect: (arg0: string) => any }
) {
  if (!req.query.access_token) {
    return res.redirect("/login");
  }
  const { access_token, refresh_token } = req.query;
  ssr_steps.setAuth({ access_token });

  // res.write(ssr_steps.critcss);
  // res.write(ssr_steps.inlinejs);

  await ssr_steps.ssr1(res, { access_token });
  await ssr_steps.ssr2(res, { access_token }); // { access_token, refresh_token ));
});

function generateRandomString() {
  return "42";
}
var client_id = process.env.spotify_client_id;
var client_secret = process.env.spotify_secret;
var redirect_uri = "http://localhost:3000/playback";
var stateKey = "spotify_auth_state";

router.get("/login", function (
  req: { query: { jshost: any; scope: string } },
  res: {
    cookie: (arg0: string, arg1: string) => void;
    redirect: (arg0: string) => void;
  }
) {
  var state = generateRandomString();
  res.cookie(stateKey, state);
  res.cookie("jshost", req.query.jshost || "");
  const scopes = [
    "user-top-read",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming",
  ];
  // your routerlication requests authorization
  var scope = req.query.scope || scopes.join(",");

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: 42,
      })
  );
});

router.get("/playback", function (
  req: { query: { code: any } },
  res: { redirect: (arg0: string) => void }
) {
  var code = req.query.code || null;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    json: true,
  };
  request.post(authOptions, function (
    error: any,
    response: { statusCode: number },
    body: any
  ) {
    if (!error && response.statusCode === 200) {
      res.redirect("/?" + querystring.stringify(body));
    }
  });
});
const request = require("request"); // "Request" library
const querystring = require("querystring");

router.get("/refresh_token", function (
  req: { query: { refresh_token: any } },
  res: { send: (arg0: { access_token: any }) => void }
) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (
    error: any,
    response: { statusCode: number },
    body: { access_token: any }
  ) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

app.use("/", router).listen(3000, () => console.log("started"));

module.exports = router;

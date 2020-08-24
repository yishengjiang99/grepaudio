import { Component } from "react";
import { renderToString } from "react-dom/server";
import { Transform } from "stream";

export class RenderReact extends Transform {
  private mapJson: any;
  constructor(mapJson: any) {
    super();
    this.mapJson = mapJson;
  }

  _transform(chunk, encoding, callback) {
    debugger;
    const json = JSON.parse(chunk);
    const component = this.mapJson(json);
    if (component) {
      this.emit("data", renderToString(component));
    }
    callback();
  }
}
// curl -X "GET" "https://api.spotify.com/v1/me/top/tracks?limit=5" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer
// const headers = `-H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ${access_token}`
// const cmd = `curl "https://api.spotify.com/v1${uri} ${headers}`
// curl -X "GET" "https://api.spotify.com/v1/me/top/tracks?limit=5" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer BQD987QyxqnSf-4wen-OdVN1vWUxfXSB_GrbG1w86FijaY_dnubOjFcH5beGQzZR6xC8T5jK6-aOQOjNaR24BWayblTQduX7wekNtf8tSVd4RFrxKTK2sWXu96TTYXuzwSSfqen2aNdeHBp69dkdxTyYHv_PgT-"

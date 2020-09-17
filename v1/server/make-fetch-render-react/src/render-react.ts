import { createElement, Component } from "react";
import { renderToString } from "react-dom/server";
import { Transform } from "stream";

export class JsonToReact extends Transform {
  private mapJson: (jsonObj: any) => Component | null;
  constructor(mapJson: (json: any) => Component | null) {
    super();
    this.mapJson = mapJson;
  }

  transform(chunk, encoding, callback) {
    const json = JSON.parse(chunk);
    const component = this.mapJson(json);
    if (component) {
      this.emit("data", renderToString(component));
    }
    callback();
  }
}

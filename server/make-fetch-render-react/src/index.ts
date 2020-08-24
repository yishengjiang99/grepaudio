import { Writable, Readable } from "stream";
import { RenderReact } from "./render-react";

import { ParseJson } from "./parse-json";

const parseJsonRenderReact = (
  rs: Readable,
  mapJson: () => void,
  writable: Writable
) => {
  rs.pipe(new ParseJson()).pipe(new RenderReact(mapJson)).pipe(writable);
};
export { parseJsonRenderReact, ParseJson, RenderReact };

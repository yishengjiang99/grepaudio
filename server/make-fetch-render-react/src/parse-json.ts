import { Transform, TransformCallback } from "stream";

const listStart = "[";
const listEnd = "]";
const objectStart = "{";
const objectEnd = "}";

export class ParseJson extends Transform {
  private stack: string[];
  private list: string[];
  constructor() {
    super();
    this.stack = ["root", ""]; //start at index 1;
    this.list = null;
  }
  pushJsonToParent(json: string) {
    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1] += json;
    }
  }
  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback
  ) {
    const strinput = chunk.toString();
    for (let i = 0; i < strinput.length; i++) {
      switch (strinput[i]) {
        case listStart:
          this.stack.push("[");
          this.list = [];
          break;
        case objectStart:
          let newstr = "" + strinput[i];
          this.stack.push(newstr);
          break;
        case listEnd:
          if (this.stack.length === 0) {
            this.emit("error", new Error("json malformat" + strinput));
          }
          this.pushJsonToParent(this.list.join(","));
          this.emit("list", this.stack.pop());
          this.pushJsonToParent(this.stack.pop());
          //strinput[i]);
          // var completeStr = this.stack.pop();
          // this.emit("data", completeStr);
          // this.pushJsonToParent(completeStr);

          break;
        case objectEnd:
          if (this.stack.length === 0) {
            this.emit("error", new Error("json malformat" + strinput));
          }
          this.pushJsonToParent(strinput[i]);

          var completeStr = this.stack.pop();
          this.emit("data", completeStr);
          this.pushJsonToParent(completeStr);
          this.list && this.list.push(completeStr);
          break;
        case ",":
          this.pushJsonToParent(",");
          break;
        default:
          this.pushJsonToParent(strinput[i]);
          break;
      }
    }
    callback();
  }
}

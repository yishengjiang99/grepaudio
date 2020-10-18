/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable no-console */
import { createServer, IncomingMessage, ServerResponse } from "http";
import { createHash } from "crypto";
import { Server, Socket } from "net";
import { cspawn } from "./types";
import { PassThrough } from "stream";

// https://tools.ietf.org/html/rfc6455
export const decodeWsMessage = (msg: Buffer): Buffer => {
  // we only support binary so we are ignoring some bits here
  // and only marginally care about length bits
  const masked = !(msg[1] & 0x80);
  const eom = !(msg[0] & 0x80);
  const maskOffset = msg[1] ^ 0x7e ? 3 : msg[1] ^ 0x7f ? 5 : 11;
  const dataOffset = maskOffset + (masked ? 4 : 0);
  if (!masked) {
    return msg.slice(dataOffset);
  }
  const mask = msg.slice(maskOffset, maskOffset + 4);
  msg = msg.slice(dataOffset);
  return new Proxy(msg, {
    get(obj, i: number) {
      return obj[i] ^ mask[i & 3];
    },
  });
};

const AU_24_FL_350FPS_STERO = 1024 * 16;
export const writeFrame = (socket, data: Buffer) => {
  const frameSize = AU_24_FL_350FPS_STERO;
  const eom_header = Buffer.from([0x80, 0x7e, 0x3f, 0x82]);
  const not_eom_header = Buffer.from([0x00, 0x7e, 0x3f, 0x82]);
  const n = Math.ceil(data.byteLength / frameSize);
  for (let i = 0; i < n; i++) {
    socket.write(i < n - 1 ? not_eom_header : eom_header);
    socket.write(data.slice(i * frameSize, i * frameSize + frameSize));
  }
};

export const writeGoodBye = (socket) => {
  socket.write([0x88]);
};
export type WsSocket = {
  send: (msg: Buffer) => void;
  write: (msg: Buffer) => void;
  context: any;
  socket: Socket;
};

export interface WebSocketServerProps {
  onHttp?: (req: IncomingMessage, res: ServerResponse) => void;
  onConnection?: (socket: WsSocket) => void;
  onData?: (socket: WsSocket, data: Buffer) => void;
  port: number | string;
  onListening?: (msg: string) => void;
}

export function WebSocketServer(props: WebSocketServerProps): Server {
  const { onConnection, onHttp, onData, onListening, port } = props;
  const httpd = createServer((req, res) => {
    onHttp ? onHttp(req, res) : res.end(200);
  });
  httpd
    .on("connection", () => {})
    .on("upgrade", (req, socket: Socket) => {
      const key = req.headers["sec-websocket-key"].trim();
      const digest = createHash("sha1")
        .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
        .digest("base64");
      socket.write("HTTP/1.1 101 Switching Protocols \r\n");
      socket.write("Upgrade: websocket \r\n");
      socket.write("Connection: Upgrade \r\n");
      socket.write(`Sec-WebSocket-Accept: ${digest} \r\n`);
      socket.write("\r\n");
      const wssocket: WsSocket = {
        socket,
        send: (msg) => writeFrame(socket, msg),
        write: (msg) => writeFrame(socket, msg),
        context: new Map<string, any>(),
      };
      onConnection && onConnection(wssocket);
      socket.on("data", (d: Buffer) => onData(wssocket, decodeWsMessage(d)));
    })
    .on("error", (e) => {
      console.error(e);
    })
    .listen(port);
  httpd.on("listening", () => {
    onListening && onListening("listening on " + port);
  });
  return httpd;
}

export function testformat() {
  //	wsReply(Buffer.from("12345")); //, { fin: false, binary: true, mask: true });
}
export function wscat(port = 4150) {
  const nc = cspawn("nc", "localhost " + port);
  nc.stdin.on("pipe", () => {
    nc.stdin.write(
      `GET ws://localhost:${port}/ HTTP/1.1\r\n` +
        `Host: localhost:${port}\r\n` +
        "Connection: Upgrade\r\n" +
        "Upgrade: websocket\r\n" +
        "Sec-WebSocket-Key: ytXUbOG6G/3lEbiqv7Bwzg==\r\n" +
        "Sec-WebSocket-Extensions: what she said\r\n\r\n"
    );
  });
  const hexdump = cspawn("hexdump", "");
  nc.stdout.pipe(process.stdout);

  nc.stdout.on("error", (d) => {
    process.stdout.write(d.toString());
  });

  process.stdin.pipe(nc.stdin);
}

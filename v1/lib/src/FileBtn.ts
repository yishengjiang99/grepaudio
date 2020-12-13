import { clickBtn, cdiv, errHandle, setupUI, stdout } from "./stdoutPanel";
export type RequstFileHandle = () => Promise<[FileSystemFileHandle] | FileSystemDirectoryHandle | void>;

const tree: Map<string, HTMLElement> = setupUI("vscode", "fileList, cmdPallet, xterm, editor1, editor2".split(", "));
const fileList = tree.get("/container/fileList"); // || alert("filelist not found");
const edittor1 = tree.get("/container/editor1"); // || alert("filelist not found");

export const openDirectory = () => {
  if (!fileList) throw "section fileList not found";
  clickBtn(
    "find mp3s",
    async () => {
      showDirectoryPicker()
        .then((handle) => {
          listDirectory(handle, fileList);
        })
        .catch(errHandle);
    },
    fileList
  );
};

export async function listDirectory(dir: FileSystemDirectoryHandle, target: HTMLElement) {
  const iterator = await dir.entries();
  const list = document.createElement("ul");

  for await (const [name, fh] of iterator) {
    list.appendChild(renderFileItem(name, fh));
  }
  target.append(list);
}

export function renderFileItem(name: string, fh: FileSystemHandle) {
  if (!edittor1 || !fileList) {
    throw "fileList not found edittor1 not found";
  }
  const link = cdiv("a", { href: "#" + name }, ["&folder;", name]);
  link.onclick = () => (fh.isDirectory ? listDirectory(fh, fileList) : readFileContent(fh, edittor1));
  return cdiv("li", {}, [link]);
}

export function readFileContent(fh: FileSystemFileHandle, target: HTMLElement) {
  target.innerHTML = "";
  fh.getFile().then((file) => {
    const fr = new FileReader();
    fr.readAsArrayBuffer(file);
    fr.onload = function () {
      if (typeof fr.result === "string") stdout(fr.result);
      else if (fr.result !== null) {
        stdout(hexdump(fr.result));
      }
    };
  });
}
const hexdump = (ab: ArrayBuffer): string => {
  let ret = "";
  while (ab.byteLength) {
    ret += "0x" + ab.slice(0, 1) + " ";
    ab = ab.slice(1);
  }
  return ret;
};
const midiMimeTypes = {
  types: [
    {
      description: "Text Files",
      accept: {
        "audio/x-midi": [".mid"],
        "text/csv": [".csv"],
      },
    },
  ],
};
const PCMType = {
  types: [
    {
      description: "Tpcmext Files",
      accept: {
        "audio/pcm": [".pcm"],
      },
    },
  ],
};

export const loadPCM = () => {
  clickBtn(
    "load midi",
    async () => {
      const ctx = new AudioContext({ latencyHint: "playback" });
      await ctx.audioWorklet.addModule("./dist/playback-proc.js");
      const node = new AudioWorkletNode(ctx, "playback-processor", {
        outputChannelCount: [6],
        numberOfOutputs: 1,
      });
      node.channelInterpretation = "discrete";

      node.connect(ctx.destination, 0);

      ctx.destination.channelInterpretation = "discrete";

      stdout("starting");
      const { writable, readable } = new TransformStream();
      const [fh] = await showOpenFilePicker(PCMType);
      (async () => {
        const file = await fh.getFile();
        file.stream().pipeTo(writable);
      })();
      // @ts-ignore
      node.port.postMessage({ readable: readable }, [readable]);
    },
    fileList
  );
};

export const getFileReader = () => {};
stdout("jsload");

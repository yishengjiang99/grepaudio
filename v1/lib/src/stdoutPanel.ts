import { MouseEventHandler } from "react";

type FileName = string;
type Dirname = string;
type Nodes = (FileName | Dirname)[];
type Xpath = string;
let _DOMTree = new Map<Xpath, HTMLElement>();

export function setupUI(containerDivId: string, sections: string[]): Map<Xpath, HTMLElement> {
  _DOMTree.set("/" + containerDivId, cdiv("div", { id: containerDivId, class: containerDivId }));
  const root = _DOMTree.get("/" + containerDivId);
  if (!root) throw "root div not found";
  for (let section of sections) {
    const div = cdiv("div", { class: section }, []);
    root.appendChild(div);
    _DOMTree.set(`/container/${section}`, div);
  }
  document.body.append(root);
  return _DOMTree;
}

export const clickBtn = (label: string, reqFn: (event: MouseEvent) => any, appendTo?: HTMLElement): HTMLElement => {
  const btn = document.createElement("button");
  btn.onclick = reqFn;
  btn.innerHTML = label;
  if (appendTo) appendTo.append(btn);
  return btn;
};

export const $ = document.querySelector;
export const cdiv = (
  tag: string,
  attributes: { [k: string]: string } = {},
  children: (HTMLElement | string)[] = []
) => {
  const div = document.createElement(tag);
  Object.keys(attributes).map((k) => {
    div.setAttribute(k, attributes[k]);
  });
  for (const c of children) {
    if (typeof c === "string") {
      div.innerHTML += `<span>${c}`;
    } else {
      div.append(c);
    }
  }
  return div;
};
let UIP = {
  dev2: _DOMTree.get("xterm"),
  rx1: _DOMTree.get("sidebarNav"),
};
export const stdout = (str: string, parentDiv?: HTMLElement) => {
  if (UIP.dev2) {
    UIP.dev2.innerHTML = str += UIP.dev2.innerHTML;
  } else {
    UIP.dev2 = cdiv("pre", { id: "dev2" }, []);
    (parentDiv || document.body).append(UIP.dev2);
  }
};
export const rx1 = (str: string, parentDiv?: HTMLElement) => {
  if (UIP.rx1) {
    UIP.rx1.innerHTML = str;
  } else {
    UIP.rx1 = cdiv("span", { id: "rx1" }, []);
    (parentDiv || document.body).append(UIP.rx1);
  }
};

export const errHandle = function (e: Error) {
  alert(e.message);
};

import { Children, Builder, EventMap, Props, PatchedElement, Child } from "./types";

function setChildren(target: PatchedElement, childList: Children) {
  let first: Node | null = null;
  const oldKeyed = target.$k || {};
  const newKeyed = (target.$k = {});
  childList.forEach((raw, implicitKey) => {
    const isKeyed = raw instanceof Array;
    let child: Child | Node = isKeyed ? raw[0] : raw;
    const key = isKeyed ? raw[1] : implicitKey;
    if (typeof child === 'function') child = child(oldKeyed[key]);
    if (typeof child === 'string') child = text(child);
    if (!child) return;
    newKeyed[key] = child;
    target.appendChild(child);
    first = child;
  });
  while (target.firstChild !== first) target.removeChild(target.firstChild);
}

function updateEvents(node: PatchedElement, events: EventMap) {
  const cache = node.$e || (node.$e = {});
  for (const event in events) {
    const listener = events[event];
    cache[event] && node.removeEventListener(event, cache[event]);
    (cache[event] = listener) && node.addEventListener(event, listener);
  }
}

function assign<T extends Element>(node: PatchedElement, props: Props<T>) {
  for (const key in props) {
    const newValue = props[key];
    if (key === "on") {
      updateEvents(node, newValue as any);
    } else if (key === 'style') {
      Object.assign(node[key], newValue);
    } else if (key !== "list" && key !== "form" && key in node) {
      node[key] = newValue;
    } else if (typeof newValue === 'string') {
      node.setAttribute(key, newValue);
    } else {
      node.removeAttribute(key);
    }
  }
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, 
  props?: Props<HTMLElementTagNameMap[K]>,
  children?: Children
): Builder<HTMLElementTagNameMap[K]>;
export function el<T extends Element>(tag: string, props?: Props<T>, children?: Children): Builder<T>;
export function el<T extends Element>(tag: string, props: Props<T> = {}, children?: Children) {
  return function build(node: Element = document.createElement(tag)) {
    build['current'] = node;
    up(node as T, props, children);
    return node;
  }
}

export function up<T extends Element>(node: T, props: Props<T> = {}, children?: Children): void {
  assign(node, props);
  children && setChildren(node, children);
}

export function text(text: string) {
  return document.createTextNode(text);
}

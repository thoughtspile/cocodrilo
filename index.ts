import { Children, Builder, EventMap, Props, PatchedElement } from "./types";

function setChildren<T extends Element>(target: PatchedElement, childList: Children) {
  let first: Node | null = null;
  let implicitKey = 0;
  const oldKeyed = target.keyed || {};
  const newKeyed = (target.keyed = {});
  childList.forEach((raw) => {
    const isKeyed = Array.isArray(raw);
    const c = isKeyed ? raw[0] : raw;
    const key = isKeyed ? raw[1] : implicitKey++;
    const child = typeof c === 'function' ? c(oldKeyed[key]) : c;
    if (child) {
      const node = child instanceof Node ? child : text(child);
      newKeyed[key] = node;
      target.appendChild(node);
      first = first || node;
    }
  });
  while (target.firstChild !== first) target.removeChild(target.firstChild);
}

function updateEvents(node: PatchedElement, events: EventMap) {
  const cache = node.events || (node.events = {});
  Object.entries(events).forEach(([event, listener]) => {
    cache[event] && node.removeEventListener(event, cache[event]);
    (cache[event] = listener) && node.addEventListener(event, listener);
  });
}

function assign<T extends Element>(node: PatchedElement, props: Props<T>) {
  Object.entries(props).forEach(([key, newValue]) => {
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
  });
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, 
  props?: Props<HTMLElementTagNameMap[K]>,
  children?: Children
): Builder<HTMLElementTagNameMap[K]>;
export function el<T extends Element>(tag: string, props?: Props<T>, children?: Children): Builder<T>;
export function el<T extends Element>(tag: string, props: Props<T> = {}, children?: Children) {
  return function build(prev: Element) {
    const node = (prev || document.createElement(tag)) as T;
    build['current'] = node;
    up(node, props, children);
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

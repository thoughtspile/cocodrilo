import { Children, Builder, EventMap, Props, PatchedElement } from "./types";

var implicitKey = [0];
var getKey = () => implicitKey[0]++;

function setChildren<T extends Element>(target: T, childList: Children) {
  implicitKey.unshift(0);
  let first: Node | null = null;
  childList.forEach((c) => {
    const child = typeof c === 'function' ? c(target) : c;
    if (!child) return;
    const node = child instanceof Node ? child : text(child);
    target.appendChild(node);
    !first && (first = node);
  });
  implicitKey.shift();
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
  return function build(parent: Element) {
    const key = tag + (props.$key || getKey());
    const match = parent.querySelector(`[data-key="${key}"]`);
    const node = (match || document.createElement(tag)) as T;
    node.setAttribute('data-key', key);
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

import { Children, Builder, EventMap, Props, PatchedElement, Child, Component, Sync } from "./types";

function setChildren(target: PatchedElement, childList: Children) {
  let first: Node | null = null;
  const oldKeyed = target.$k || {};
  const newKeyed = (target.$k = {});
  childList.forEach((child: Node | Child, key: string | number) => {
    if (typeof child === 'string') child = text(child);
    if (typeof child === 'function') {
      key = child.key || key;
      child = child(oldKeyed[key]);
    }
    if (!child) return;
    if (!(child instanceof Node)) child = child.current;
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
export function el<T extends Element, Props>(
  tag: Component<T, Props>,
  props?: Props,
  children?: Children
): Builder<T>;
export function el<T extends Element>(
  tag: string, 
  props?: Props<T>, 
  children?: Children
): Builder<T>;
export function el<T extends Element>(tag: string | Component<any>, props: Props<T> = {}, children?: Children) {
  const init = typeof tag === 'string' ? domComponent(tag) : tag;
  return (node = initComponent(init, props, children)) => node;
}

function domComponent(tag: string): Component<any, Props<any>> {
  const node = document.createElement(tag);
  return () => (props, children) => up(node, props, children);
}

function initComponent(init: Component<any, any>, props: any, children?: any): Builder<any> {
  const sync = init(props, children);
  const node = sync(props, children) as Builder<any>;
  node.$s = (props, children) => node.current = sync(props, children);
  node.key = props.key;
  return node;
}

export function up<T extends Element>(node: T, props: Props<T> = {}, children?: Children): T {
  assign(node, props);
  children && setChildren(node, children);
  return node;
}

export function text(text: string) {
  return document.createTextNode(text);
}

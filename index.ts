import { Children, Builder, EventMap, Props, PatchedElement, Child, Component } from "./types";

function setChildren(target: PatchedElement, childList: Children) {
  let first: Node | null = null;
  const oldKeyed = target.$k || {};
  const newKeyed = (target.$k = {});
  childList.forEach((child: Node | Child, key: string | number) => {
    if (typeof child === 'function') {
      key = child.key || key;
      child = child(oldKeyed[key]);
    }
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
export function el<T extends Element>(tag: any, props: Props<T> = {}, children?: Children) {
  const isElement = typeof tag === 'string';
  function build(node: Element = isElement ? document.createElement(tag) : tag(props, children)) {
    build['current'] = node;
    isElement && up(node as T, props, children);
    return node;
  };
  build.key = props.key;
  return build as Builder<T>;
}

export function up<T extends Element>(node: T, props: Props<T> = {}, children?: Children): void {
  assign(node, props);
  children && setChildren(node, children);
}

export function text(text: string) {
  return document.createTextNode(text);
}

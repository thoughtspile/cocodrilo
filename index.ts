import { Children, Builder, EventMap, Props } from "./types";

function setChildren<T extends Element>(
  target: T, 
  childList: Children,
): T {
  let first: Node | null = null;
  childList.forEach((c) => {
    const child = typeof c === 'function' ? c(target) : c;
    if (!child) return;
    const node = child instanceof Node ? child : text(child);
    target.appendChild(node);
    !first && (first = node);
  });
  while (target.firstChild !== first) target.removeChild(target.firstChild);
  return target;
}

function updateEvents(node: Element & { events?: EventMap }, events: EventMap) {
  const cache = node.events || (node.events = {});
  Object.entries(events).forEach(([event, listener]) => {
    cache[event] && node.removeEventListener(event, cache[event]);
    (cache[event] = listener) && node.addEventListener(event, listener);
  });
}

function assign<T extends Element>(node: T, props: Props<T>): T {
  Object.entries(props).forEach(([key, newValue]) => {
    if (key === "key") {
    } else if (key === "on") {
      updateEvents(node, newValue as any);
    } else if (key === 'style') {
      Object.assign(node[key], newValue);
    } else if (key === '$key') {
      node.setAttribute(key, newValue as any);
    } else if (key !== "list" && key !== "form" && key in node) {
      node[key] = newValue;
    } else if (typeof newValue === 'string') {
      node.setAttribute(key, newValue);
    } else {
      node.removeAttribute(key);
    }
  });
  return node;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tagName: K, 
  props?: Props<HTMLElementTagNameMap[K]>,
  children?: Children
): Builder<HTMLElementTagNameMap[K]>;
export function el<T extends Element>(tagName: string, props?: Props<T>, children?: Children): Builder<T>;
export function el<T extends Element>(tag: string, props: Props<T> = {}, children: Children = []) {
  function build(parent: Element) {
    const match = props.$key && parent.querySelector(`${tag}[data-key]=${props.$key}`);
    const node = (match || document.createElement(tag, { is: props.is })) as T;
    build['current'] = node;
    return setChildren(assign(node, props), children);
  }
  return build;
}

export function up<T extends Element>(node: T, props: Props<T> = {}, children?: Children): void {
  assign(node, props);
  children && setChildren(node, children);
}

export const text = (text: string) => document.createTextNode(text);

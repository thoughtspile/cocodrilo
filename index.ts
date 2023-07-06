import { Children, ElementChain, EventMap, Props } from "./types";

function setChildren<T extends HTMLElement>(
  target: T, 
  childList: Children
): T {
  target.childNodes.forEach(c => c.remove());
  childList.forEach(c => c && target.appendChild(c instanceof Node ? c : text(c)));
  return target as ElementChain<T>;
}

function updateEvents(node: HTMLElement & { events?: EventMap }, events: EventMap) {
  const cache = node.events || (node.events = {});
  Object.entries(events).forEach(([event, listener]) => {
    cache[event] && node.removeEventListener(event, cache[event]);
    (cache[event] = listener) && node.addEventListener(event, listener);
  });
}

function assign<T extends HTMLElement>(node: T, props: Props<T>): T {
  Object.entries(props).forEach(([key, newValue]) => {
    if (key === "key") {
    } else if (key === "on") {
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
  return node;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tagName: K, 
  props?: Props<HTMLElementTagNameMap[K]>,
  children?: Children
): ElementChain<HTMLElementTagNameMap[K]>;
export function el<T extends HTMLElement>(
  tagName: string, 
  props?: Props<T>,
  children?: Children
): ElementChain<T>;
export function el<T extends HTMLElement>(
  node: HTMLElement,
  props?: Props<T>,
  children?: Children
): ElementChain<T>;
export function el<T extends HTMLElement>(tag: any, props: Props<T> = {}, children: Children = []) {
  const node = (tag instanceof HTMLElement ? tag : document.createElement(tag, 'is' in props ? props : undefined)) as T;
  return setChildren(assign(node, props), children);
}

export const text = (text: string) => document.createTextNode(text);

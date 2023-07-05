import { BulkHelpers, Children, ElementChain } from "./types";

function setChildren<T extends HTMLElement>(
  target: T, 
  childList: Children
): T {
  target.childNodes.forEach(c => c.remove());
  childList.forEach(c => c && target.appendChild(c instanceof Node ? c : text(c)));
  return target as ElementChain<T>;
}

function assign<T extends HTMLElement>(
  target: T, 
  attributes: Partial<T> & Record<string, unknown>
): T {
  Object.entries(attributes).forEach(([a, v]) => {
    if (a === 'style') Object.assign(target[a], v);
    else if (a in target) target[a] = v;
    else typeof v === 'string' ? target.setAttribute(a, v) : target.removeAttribute(a)
  });
  return target;
}

function patch<T extends HTMLElement>(target: T): ElementChain<T> {
  return Object.assign(target, {
    withClass: (...classes) => {
      classes.forEach(c => {
        if (typeof c === 'string') target.classList.toggle(c, true);
        else Object.entries(c).forEach(([cls, val]) => target.classList.toggle(cls, !!val));
      });
      return target as ElementChain<T>;
    },
    on: (events, options) => {
      Object.entries(events).forEach(([e, h]) => target.addEventListener(e, h, options));
      if (options && options.stop) options.stop(e => target.removeEventListener(e, events[e], options));
      return target as ElementChain<T>;
    },
  } as BulkHelpers<T>);
}

type Props<E extends HTMLElement = HTMLElement> = ElementCreationOptions & Partial<E> & Record<string, unknown>;
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
  const node = tag instanceof HTMLElement ? tag : document.createElement(tag, 'is' in props ? props : undefined) as HTMLElement;
  return setChildren(assign(patch(node), props), children);
}

export const text = (text: string) => document.createTextNode(text);

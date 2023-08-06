import { Children, Builder, EventMap, Props, PatchedElement, Child, Component, Sync } from "./types";

function setChildren(target: PatchedElement, childList: Children) {
  let first: Node | null = null;
  const oldKeyed = target.$k || {};
  const newKeyed = (target.$k = {});
  childList.map((child: Node | Child, key: string | number) => {
    if (typeof child === 'string') {
      child = document.createTextNode(child);
    } else if (typeof child === 'function') {
      // reuse previous DOM nodes
      key = child.key || key;
      child = child(oldKeyed[key]);
    }
    child = child && child.current || child;
    if (!child) return;
    // track first child node
    first = first || child;
    // track for updates
    newKeyed[key] = child;
    // shifts child to proper position
    target.appendChild(child);
  });
  // remove obsolete children
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

export function up<T extends Element>(node: T, props: Props<T>): T {
  for (const key in props) {
    const newValue = props[key];
    if (key === "on") {
      updateEvents(node, newValue as any);
    } else if (key === 'style') {
      Object.assign(node[key], newValue);
    } else if (key === 'children') {
      setChildren(node, newValue as any);
    } else if (key !== "list" && key !== "form" && key in node) {
      node[key] = newValue;
    } else if (typeof newValue === 'string') {
      node.setAttribute(key, newValue);
    } else {
      node.removeAttribute(key);
    }
  }
  return node;
}

export function dom<K extends keyof HTMLElementTagNameMap>(
  tag: K, 
  props: Props<HTMLElementTagNameMap[K]>
): Builder<HTMLElementTagNameMap[K]>;
export function dom<T extends Element>(
  tag: string, 
  props: Props<T>
): Builder<T>;
export function dom<T extends Element>(tag: string, props: Props<T>): Builder<T> {
  const builder = (node => up(node || document.createElement(tag), props)) as Builder<T>;
  builder.key = props.key;
  return builder;
}

export function cmp<T extends Element, Props>(init: Component<T, Props>, props: Props & { key?: string }): Builder<T> {
  const builder = (node?: T) => {
    const sync = init(props);
    return node || sync(props);
  };
  builder.key = props.key;
  return builder;
}

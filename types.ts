type Event<K extends keyof HTMLElementEventMap, Tag extends HTMLElement> = HTMLElementEventMap[K] & { currentTarget: Tag };
export type EventMap<Tag extends HTMLElement = HTMLElement> = {
  [K in keyof HTMLElementEventMap]?: (this: Tag, ev: Event<K, Tag>) => any;
}
type Falsy = null | false | undefined;
export type Children = (((parent: Element) => Node) | string | Falsy)[];
export type Props<T extends HTMLElement> = ElementCreationOptions & Partial<T> & Record<string, unknown> & { 
  on?: EventMap<T>;
  $key?: unknown;
  style?: Partial<CSSStyleDeclaration>;
};
export interface Builder<T extends Element = Element> {
  (parent: Element): T;
  current: T;
}

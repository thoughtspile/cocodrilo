type Falsy = null | false | undefined;

type Event<K extends keyof HTMLElementEventMap, Tag extends Element> = HTMLElementEventMap[K] & { currentTarget: Tag };
export type EventMap<Tag extends Element = Element> = {
  [K in keyof HTMLElementEventMap]?: (this: Tag, ev: Event<K, Tag>) => any;
}

export type Children = (((parent: Element) => Node) | string | Falsy)[];

export type Props<T extends Element> = ElementCreationOptions & Partial<T> & Record<string, unknown> & { 
  on?: EventMap<T>;
  $key?: unknown;
  style?: Partial<CSSStyleDeclaration>;
};

export interface Builder<T extends Element = Element> {
  (parent: Element): T;
  current: T;
}

export type PatchedElement<T extends Element = Element> = T & { events?: EventMap<T> };
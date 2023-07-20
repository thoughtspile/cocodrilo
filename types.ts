type Falsy = null | false | undefined;

type Event<K extends keyof HTMLElementEventMap, Tag extends Element> = HTMLElementEventMap[K] & { currentTarget: Tag };
export type EventMap<Tag extends Element = Element> = {
  [K in keyof HTMLElementEventMap]?: (this: Tag, ev: Event<K, Tag>) => any;
}

export type Child = Builder | string | Falsy;
export type Children = Child[];
export type Component<T extends Element, Props = {}> = (props: Props, children?: Children) => Builder<T>;

export type Props<T extends Element> = Partial<T> & Record<string, unknown> & { 
  on?: EventMap<T>;
  style?: Partial<CSSStyleDeclaration>;
};

export interface Builder<T extends Element = Element> {
  (prev?: Element): T;
  key?: string | number;
  current: T;
}

export type PatchedElement<T extends Element = Element> = T & { $e?: EventMap<T>; $k?: Record<string, Node> };
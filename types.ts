type Falsy = null | false | undefined;

type Event<K extends keyof HTMLElementEventMap, Tag extends Element> = HTMLElementEventMap[K] & { currentTarget: Tag };
export type EventMap<Tag extends Element = Element> = {
  [K in keyof HTMLElementEventMap]?: (this: Tag, ev: Event<K, Tag>) => any;
}

export type Child = Builder<any> | string | Falsy;
export type Children = Child[];
export type Sync<T extends Element, Props> = (props: Props) => Builder<T>;
export type Component<T extends Element, Props = {}> = (props: Props) => Sync<T, Props>;

export type Key = string | number;
export type Props<T extends Element> = Partial<T> & Record<string, unknown> & { 
  key?: Key;
  on?: EventMap<T>;
  style?: Partial<CSSStyleDeclaration>;
  children?: Children;
};

export interface Builder<T extends Element = Element> {
  (prev?: Builder<T>): Builder<T>;
  $s: Sync<T, any>;
  key?: Key;
  current: T;
}

export type PatchedElement<T extends Element = Element> = T & { $e?: EventMap<T>; $k?: Record<string, Builder> };

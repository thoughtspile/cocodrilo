type Event<K extends keyof HTMLElementEventMap, Tag extends HTMLElement> = HTMLElementEventMap[K] & { currentTarget: Tag };
type EventMap<Tag extends HTMLElement> = {
  [K in keyof HTMLElementEventMap]?: (this: Tag, ev: Event<K, Tag>) => any;
}
type Falsy = null | false | undefined;
type EventOptions = AddEventListenerOptions & { stop?: (stop: (e: string) => void) => unknown };
export type Children = (Node | string | Falsy)[];

export interface BulkHelpers<Tag extends HTMLElement> {
  withClass(...classes: (string | Record<string, unknown>)[]): ElementChain<Tag>;
  withStyle(style: Partial<CSSStyleDeclaration>): ElementChain<Tag>;
  on(events: EventMap<Tag>, options?: EventOptions): ElementChain<Tag>;
}
export type ElementChain<T extends HTMLElement = HTMLElement> = T & BulkHelpers<T>;

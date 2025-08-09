export class TpEvent<T = unknown> {
  constructor(target: T);
  target: T;
}

export class TpChangeEvent<TValue = unknown, TTarget = unknown> extends TpEvent<TTarget> {
  constructor(target: TTarget, value: TValue, last?: boolean);
  value: TValue;
  last: boolean;
}

export interface ButtonApi {
  label: string | undefined;
  title: string;
  on(
    event: "click",
    handler: (ev: { target: ButtonApi; native: MouseEvent }) => void
  ): this;
  off(event: "click", handler: Function): this;
}

export interface BindingApi<T = any> {
  /** label shown next to the control */
  label?: string;
  /** arbitrary tag you can set/read */
  tag?: string | undefined;

  /** Re-read from bound object and update UI */
  refresh(): void;

  /** Fires for both programmatic + user changes (legacy behavior) */
  on(event: "change", handler: (ev: TpChangeEvent<T, BindingApi<T>>) => void): this;

  /**
   * Fires only for user-driven (GUI) changes: typing, dragging, picking color, etc.
   * Programmatic updates (object[key] = x, api.refresh(), etc.) do NOT trigger this.
   */
  on(event: "internal-change", handler: (ev: TpChangeEvent<T, BindingApi<T>>) => void): this;

  off(event: "change" | "internal-change", handler: Function): this;
}

export interface FolderApi {
  title?: string;
  expanded: boolean;

  addBinding<T extends object, K extends keyof T>(
    obj: T,
    key: K,
    params?: Record<string, any>
  ): BindingApi<T[K]>;

  addFolder(params: { title: string; expanded?: boolean; index?: number }): FolderApi;
  addButton(params: { title: string; index?: number }): ButtonApi;

  /** Iterate children if you need them */
  readonly children: Array<BindingApi | FolderApi | ButtonApi>;

  on(event: "fold", handler: (ev: { target: FolderApi; expanded: boolean }) => void): this;

  /** Bubble-up of child binding changes (all changes) */
  on(event: "change", handler: (ev: TpChangeEvent<any, any>) => void): this;

  /** Bubble-up of child binding changes (user-only) */
  on(event: "internal-change", handler: (ev: TpChangeEvent<any, any>) => void): this;

  off(event: "fold" | "change" | "internal-change", handler: Function): this;
}

export class Pane implements FolderApi {
  constructor(params?: {
    title?: string;
    expanded?: boolean;
    container?: HTMLElement;
  });

  // FolderApi props
  title?: string;
  expanded: boolean;
  readonly children: Array<BindingApi | FolderApi | ButtonApi>;

  addBinding<T extends object, K extends keyof T>(
    obj: T,
    key: K,
    params?: Record<string, any>
  ): BindingApi<T[K]>;

  addFolder(params: { title: string; expanded?: boolean; index?: number }): FolderApi;
  addButton(params: { title: string; index?: number }): ButtonApi;

  on(event: "fold", handler: (ev: { target: FolderApi; expanded: boolean }) => void): this;
  on(event: "change", handler: (ev: TpChangeEvent<any, any>) => void): this;
  on(event: "internal-change", handler: (ev: TpChangeEvent<any, any>) => void): this;
  off(event: "fold" | "change" | "internal-change", handler: Function): this;

  /** Re-pulls values from bound objects for all children */
  refresh(): void;

  /** Remove the pane */
  dispose(): void;

  /** Root element */
  readonly element: HTMLElement;
}

export default Pane;
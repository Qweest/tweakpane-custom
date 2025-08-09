import { BladeApi, LabeledValueBladeController, ListController, EventListenable, ApiChangeEvents, ListItem, BaseBladeParams, ListParamsOptions, View, ViewProps, BladeController, Blade, SliderTextController, Formatter, TextController, Parser, FolderController, FolderProps, FolderApi, PluginPool, TpPluginBundle, Semver } from './core';
export { ArrayStyleListOptions, BaseBladeParams, BaseParams, BindingApiEvents, BindingParams, BladeApi, BooleanInputParams, BooleanMonitorParams, ButtonApi, ButtonParams, ColorInputParams, FolderApi, FolderParams, InputBindingApi, ListInputBindingApi, ListParamsOptions, MonitorBindingApi, NumberInputParams, NumberMonitorParams, ObjectStyleListOptions, Point2dInputParams, Point3dInputParams, Point4dInputParams, Semver, SliderInputBindingApi, StringInputParams, StringMonitorParams, TabApi, TabPageApi, TabPageParams, TabParams, TpChangeEvent, TpPlugin, TpPluginBundle } from './core';

declare class ListBladeApi<T> extends BladeApi<LabeledValueBladeController<T, ListController<T>>> implements EventListenable<ApiChangeEvents<T>> {
    private readonly emitter_;
    /**
     * @hidden
     */
    constructor(controller: LabeledValueBladeController<T, ListController<T>>);
    get label(): string | null | undefined;
    set label(label: string | null | undefined);
    get options(): ListItem<T>[];
    set options(options: ListItem<T>[]);
    get value(): T;
    set value(value: T);
    on<EventName extends keyof ApiChangeEvents<T>>(eventName: EventName, handler: (ev: ApiChangeEvents<T>[EventName]) => void): this;
    off<EventName extends keyof ApiChangeEvents<T>>(eventName: EventName, handler: (ev: ApiChangeEvents<T>[EventName]) => void): this;
}

interface ListBladeParams<T> extends BaseBladeParams {
    options: ListParamsOptions<T>;
    value: T;
    view: 'list';
    label?: string;
}

/**
 * @hidden
 */
interface Config$2 {
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class SeparatorView implements View {
    readonly element: HTMLElement;
    constructor(doc: Document, config: Config$2);
}

/**
 * @hidden
 */
interface Config$1 {
    blade: Blade;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class SeparatorController extends BladeController<SeparatorView> {
    /**
     * @hidden
     */
    constructor(doc: Document, config: Config$1);
}

declare class SeparatorBladeApi extends BladeApi<SeparatorController> {
}

interface SeparatorBladeParams extends BaseBladeParams {
    view: 'separator';
}

declare class SliderBladeApi extends BladeApi<LabeledValueBladeController<number, SliderTextController>> implements EventListenable<ApiChangeEvents<number>> {
    private readonly emitter_;
    /**
     * @hidden
     */
    constructor(controller: LabeledValueBladeController<number, SliderTextController>);
    get label(): string | null | undefined;
    set label(label: string | null | undefined);
    get max(): number;
    set max(max: number);
    get min(): number;
    set min(min: number);
    get value(): number;
    set value(value: number);
    on<EventName extends keyof ApiChangeEvents<number>>(eventName: EventName, handler: (ev: ApiChangeEvents<number>[EventName]) => void): this;
    off<EventName extends keyof ApiChangeEvents<number>>(eventName: EventName, handler: (ev: ApiChangeEvents<number>[EventName]) => void): this;
}

interface SliderBladeParams extends BaseBladeParams {
    max: number;
    min: number;
    view: 'slider';
    format?: Formatter<number>;
    label?: string;
    value?: number;
}

declare class TextBladeApi<T> extends BladeApi<LabeledValueBladeController<T, TextController<T>>> implements EventListenable<ApiChangeEvents<T>> {
    private readonly emitter_;
    /**
     * @hidden
     */
    constructor(controller: LabeledValueBladeController<T, TextController<T>>);
    get label(): string | null | undefined;
    set label(label: string | null | undefined);
    get formatter(): Formatter<T>;
    set formatter(formatter: Formatter<T>);
    get value(): T;
    set value(value: T);
    on<EventName extends keyof ApiChangeEvents<T>>(eventName: EventName, handler: (ev: ApiChangeEvents<T>[EventName]) => void): this;
    off<EventName extends keyof ApiChangeEvents<T>>(eventName: EventName, handler: (ev: ApiChangeEvents<T>[EventName]) => void): this;
}

interface TextBladeParams<T> extends BaseBladeParams {
    parse: Parser<T>;
    value: T;
    view: 'text';
    format?: Formatter<T>;
    label?: string;
}

/**
 * @hidden
 */
interface Config {
    blade: Blade;
    props: FolderProps;
    viewProps: ViewProps;
    expanded?: boolean;
    title?: string;
}
/**
 * @hidden
 */
declare class RootController extends FolderController {
    constructor(doc: Document, config: Config);
}

declare class RootApi extends FolderApi {
    /**
     * @hidden
     */
    constructor(controller: RootController, pool: PluginPool);
    get element(): HTMLElement;
}

interface PaneConfig {
    /**
     * The custom container element of the pane.
     */
    container?: HTMLElement;
    /**
     * The default expansion of the pane.
     */
    expanded?: boolean;
    /**
     * The pane title that can expand/collapse the entire pane.
     */
    title?: string;
    /**
     * @hidden
     */
    document?: Document;
}

/**
 * The root pane of Tweakpane.
 */
declare class Pane extends RootApi {
    private readonly pool_;
    private readonly usesDefaultWrapper_;
    private doc_;
    private containerElem_;
    constructor(opt_config?: PaneConfig);
    get document(): Document;
    dispose(): void;
    registerPlugin(bundle: TpPluginBundle): void;
    private setUpDefaultPlugins_;
}

declare const VERSION: Semver;

export { ListBladeApi, Pane, SeparatorBladeApi, SliderBladeApi, TextBladeApi, VERSION };
export type { ListBladeParams, SeparatorBladeParams, SliderBladeParams, TextBladeParams };

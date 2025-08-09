type Bindable = Record<string, any>;
/**
 * A binding target.
 */
declare class BindingTarget {
    /**
     * The property name of the binding.
     */
    readonly key: string;
    private readonly obj_;
    /**
     * @hidden
     */
    constructor(obj: Bindable, key: string);
    static isBindable(obj: unknown): obj is Bindable;
    /**
     * Read a bound value.
     * @return A bound value
     */
    read(): unknown;
    /**
     * Write a value.
     * @param value The value to write to the target.
     */
    write(value: unknown): void;
    /**
     * Write a value to the target property.
     * @param name The property name.
     * @param value The value to write to the target.
     */
    writeProperty(name: string, value: unknown): void;
}

/**
 * Converts an external unknown value into the internal value.
 * @template In The type of the internal value.
 */
interface BindingReader<In> {
    /**
     * @param exValue The bound value.
     * @return A converted value.
     */
    (exValue: unknown): In;
}
/**
 * Writes the internal value to the bound target.
 * @template In The type of the internal value.
 */
interface BindingWriter<In> {
    /**
     * @param target The target to be written.
     * @param inValue The value to write.
     */
    (target: BindingTarget, inValue: In): void;
}
/**
 * @hidden
 */
interface Binding {
    readonly target: BindingTarget;
}
declare function isBinding(value: unknown): value is Binding;

/**
 * A constraint for the value.
 * @template T The type of the value.
 */
interface Constraint<T> {
    /**
     * Constrains the value.
     * @param value The value.
     * @return A constarined value.
     */
    constrain(value: T): T;
}

type Handler<E> = (ev: E) => void;
/**
 * A type-safe event emitter.
 * @template E The interface that maps event names and event objects.
 */
declare class Emitter<E> {
    private readonly observers_;
    constructor();
    /**
     * Adds an event listener to the emitter.
     * @param eventName The event name to listen.
     * @param handler The event handler.
     * @param opt_options The options.
     * @param opt_options.key The key that can be used for removing the handler.
     */
    on<EventName extends keyof E>(eventName: EventName, handler: Handler<E[EventName]>, opt_options?: {
        key: unknown;
    }): Emitter<E>;
    /**
     * Removes an event listener from the emitter.
     * @param eventName The event name.
     * @param key The event handler to remove, or the key for removing the handler.
     */
    off<EventName extends keyof E>(eventName: EventName, key: Handler<E[EventName]> | unknown): Emitter<E>;
    emit<EventName extends keyof E>(eventName: EventName, event: E[EventName]): void;
}

interface ValueChangeOptions {
    /**
     * The flag indicating whether an event should be fired even if the value doesn't change.
     */
    forceEmit: boolean;
    /**
     * The flag indicating whether the event is for the last change.
     */
    last: boolean;
}
interface ValueEvents<T, V = Value<T>> {
    beforechange: {
        sender: V;
    };
    change: {
        options: ValueChangeOptions;
        previousRawValue: T;
        rawValue: T;
        sender: V;
        isInternalChange?: boolean;
    };
}
/**
 * A value that handles changes.
 * @template T The type of the raw value.
 */
interface Value<T> {
    /**
     * The event emitter for value changes.
     */
    readonly emitter: Emitter<ValueEvents<T>>;
    /**
     * The raw value of the model.
     */
    rawValue: T;
    setRawValue(rawValue: T, options?: ValueChangeOptions): void;
}
type ReadonlyValueEvents<T> = ValueEvents<T, ReadonlyValue<T>>;
/**
 * A readonly value that can be changed elsewhere.
 * @template T The type of the raw value.
 */
interface ReadonlyValue<T> {
    /**
     * The event emitter for value changes.
     */
    readonly emitter: Emitter<ReadonlyValueEvents<T>>;
    /**
     * The raw value of the model.
     */
    readonly rawValue: T;
}

interface ValueMapEvents<O extends Record<string, unknown>> {
    change: {
        key: keyof O;
        sender: ValueMap<O>;
    };
}
type ValueMapCore<O extends Record<string, unknown>> = {
    [Key in keyof O]: Value<O[Key]>;
};
declare class ValueMap<O extends Record<string, unknown>> {
    readonly emitter: Emitter<ValueMapEvents<O>>;
    private readonly valMap_;
    /**
     * @hidden
     */
    constructor(valueMap: ValueMapCore<O>);
    static createCore<O extends Record<string, unknown>>(initialValue: O): ValueMapCore<O>;
    static fromObject<O extends Record<string, unknown>>(initialValue: O): ValueMap<O>;
    get<Key extends keyof O>(key: Key): O[Key];
    set<Key extends keyof O>(key: Key, value: O[Key]): void;
    value<Key extends keyof O>(key: Key): Value<O[Key]>;
}

type ViewPropsObject = {
    disabled: boolean;
    disposed: boolean;
    hidden: boolean;
    parent: ViewProps | null;
};
type ViewPropsEvents = ValueMapEvents<ViewPropsObject>;
interface Disableable {
    disabled: boolean;
}
interface ViewPropsState {
    disabled: boolean;
    hidden: boolean;
}
declare class ViewProps extends ValueMap<ViewPropsObject> {
    private readonly globalDisabled_;
    private readonly setGlobalDisabled_;
    /**
     * @hidden
     */
    constructor(valueMap: {
        [Key in keyof ViewPropsObject]: Value<ViewPropsObject[Key]>;
    });
    static create(opt_initialValue?: Partial<ViewPropsObject>): ViewProps;
    get globalDisabled(): ReadonlyValue<boolean>;
    bindClassModifiers(elem: HTMLElement): void;
    bindDisabled(target: Disableable): void;
    bindTabIndex(elem: HTMLOrSVGElement): void;
    handleDispose(callback: () => void): void;
    importState(state: ViewPropsState): void;
    exportState(): ViewPropsState;
    /**
     * Gets a global disabled of the view.
     * Disabled of the view will be affected by its disabled and its parent disabled.
     */
    private getGlobalDisabled_;
    private updateGlobalDisabled_;
    private onDisabledChange_;
    private onParentGlobalDisabledChange_;
    private onParentChange_;
}

/**
 * A view interface.
 */
interface View {
    /**
     * A root element of the view.
     */
    readonly element: HTMLElement;
}
/**
 * @hidden
 */
interface InputView extends View {
    readonly inputElement: HTMLInputElement;
}

type Formatter<T> = (value: T) => string;

type NumberTextPropsObject = {
    formatter: Formatter<number>;
    keyScale: number;
    pointerScale: number;
};
/**
 * @hidden
 */
type NumberTextProps = ValueMap<NumberTextPropsObject>;
/**
 * @hidden
 */
interface NumberConfig {
    dragging: Value<number | null>;
    props: NumberTextProps;
    value: Value<number>;
    viewProps: ViewProps;
    arrayPosition?: 'fst' | 'mid' | 'lst';
}
/**
 * @hidden
 */
declare class NumberTextView implements View, InputView {
    readonly inputElement: HTMLInputElement;
    readonly knobElement: HTMLElement;
    readonly element: HTMLElement;
    readonly value: Value<number>;
    private readonly props_;
    private readonly dragging_;
    private readonly guideBodyElem_;
    private readonly guideHeadElem_;
    private readonly tooltipElem_;
    constructor(doc: Document, config: NumberConfig);
    private onDraggingChange_;
    refresh(): void;
    private onChange_;
}

interface BaseParams {
    disabled?: boolean;
    hidden?: boolean;
    index?: number;
}
type ArrayStyleListOptions<T> = {
    text: string;
    value: T;
}[];
type ObjectStyleListOptions<T> = {
    [text: string]: T;
};
type ListParamsOptions<T> = ArrayStyleListOptions<T> | ObjectStyleListOptions<T>;
type PickerLayout = 'inline' | 'popup';
interface BindingParams$1 extends BaseParams {
    label?: string;
    tag?: string | undefined;
    view?: string;
}
interface BaseInputParams extends BindingParams$1, Record<string, unknown> {
    readonly?: false;
}
interface BaseMonitorParams extends BindingParams$1, Record<string, unknown> {
    bufferSize?: number;
    interval?: number;
    readonly: true;
}
interface BaseBladeParams extends BaseParams, Record<string, unknown> {
}
interface NumberTextInputParams {
    format?: Formatter<number>;
    /**
     * The unit scale for key input.
     */
    keyScale?: number;
    max?: number;
    min?: number;
    /**
     * The unit scale for pointer input.
     */
    pointerScale?: number;
    step?: number;
}
type PointDimensionParams = NumberTextInputParams;

interface PointAxis {
    constraint: Constraint<number> | undefined;
    textProps: NumberTextProps;
}
declare function createPointAxis(config: {
    constraint: Constraint<number> | undefined;
    initialValue: number;
    params: PointDimensionParams;
}): PointAxis;

/**
 * A controller that has a view to control.
 */
interface Controller<V extends View = View> {
    readonly view: V;
    readonly viewProps: ViewProps;
}

type BladePosition = 'veryfirst' | 'first' | 'last' | 'verylast';
declare function getAllBladePositions(): BladePosition[];

type Blade = ValueMap<{
    positions: BladePosition[];
}>;
declare function createBlade(): Blade;

interface ValueController<T, Vw extends View = View, Va extends Value<T> = Value<T>> extends Controller<Vw> {
    readonly value: Va;
}

/**
 * @hidden
 */
interface RackEvents {
    add: {
        bladeController: BladeController;
        index: number;
        root: boolean;
        sender: Rack;
    };
    remove: {
        bladeController: BladeController;
        root: boolean;
        sender: Rack;
    };
    valuechange: {
        bladeController: BladeController & ValueController<unknown>;
        options: ValueChangeOptions;
        sender: Rack;
    };
    layout: {
        sender: Rack;
    };
}
/**
 * @hidden
 */
interface Config$P {
    blade?: Blade;
    viewProps: ViewProps;
}
/**
 * A collection of blade controllers that manages positions and event propagation.
 * @hidden
 */
declare class Rack {
    readonly emitter: Emitter<RackEvents>;
    readonly viewProps: ViewProps;
    private readonly blade_;
    private readonly bcSet_;
    constructor(config: Config$P);
    get children(): BladeController[];
    add(bc: BladeController, opt_index?: number): void;
    remove(bc: BladeController): void;
    find<B extends BladeController>(finder: (bc: BladeController) => bc is B): B[];
    private onSetAdd_;
    private onSetRemove_;
    private updatePositions_;
    private onChildPositionsChange_;
    private onChildViewPropsChange_;
    private onChildDispose_;
    private onChildValueChange_;
    private onRackLayout_;
    private onRackValueChange_;
    private onBladePositionsChange_;
}

type MicroParsingResult<T> = {
    succeeded: true;
    value: T | undefined;
} | {
    succeeded: false;
    value: undefined;
};
type MicroParser<T> = (value: unknown) => MicroParsingResult<T>;
declare const MicroParsers: {
    optional: {
        custom: <T>(parse: (value: unknown) => T | undefined) => MicroParser<T>;
        boolean: MicroParser<boolean>;
        number: MicroParser<number>;
        string: MicroParser<string>;
        function: MicroParser<Function>;
        constant: <T_1>(value: T_1) => MicroParser<T_1>;
        raw: MicroParser<unknown>;
        object: <O extends Record<string, unknown>>(keyToParserMap: { [Key in keyof O]: MicroParser<O[Key]>; }) => MicroParser<O>;
        array: <T_2>(itemParser: MicroParser<T_2>) => MicroParser<T_2[]>;
    };
    required: {
        custom: <T>(parse: (value: unknown) => T | undefined) => MicroParser<T>;
        boolean: MicroParser<boolean>;
        number: MicroParser<number>;
        string: MicroParser<string>;
        function: MicroParser<Function>;
        constant: <T_1>(value: T_1) => MicroParser<T_1>;
        raw: MicroParser<unknown>;
        object: <O extends Record<string, unknown>>(keyToParserMap: { [Key in keyof O]: MicroParser<O[Key]>; }) => MicroParser<O>;
        array: <T_2>(itemParser: MicroParser<T_2>) => MicroParser<T_2[]>;
    };
};
declare function parseRecord<O extends Record<string, unknown>>(value: Record<string, unknown>, keyToParserMap: (p: typeof MicroParsers) => {
    [Key in keyof O]: MicroParser<O[Key]>;
}): O | undefined;

/**
 * A state object for blades.
 */
type BladeState = Record<string, unknown>;
/**
 * A utility function for importing a blade state.
 * @param state The state object.
 * @param superImport The function to invoke super.import(), or null for no super.
 * @param parser The state micro parser object.
 * @param callback The callback function that will be called when parsing is successful.
 * @return true if parsing is successful.
 */
declare function importBladeState<O extends BladeState>(state: BladeState, superImport: ((state: BladeState) => boolean) | null, parser: (p: typeof MicroParsers) => {
    [key in keyof O]: MicroParser<O[key]>;
}, callback: (o: O) => boolean): boolean;
/**
 * A utility function for exporting a blade state.
 * @param superExport The function to invoke super.export(), or null for no super.
 * @param thisState The blade state from the current blade.
 * @return An exported object.
 */
declare function exportBladeState(superExport: (() => BladeState) | null, thisState: BladeState): BladeState;
/**
 * An interface that can import/export a state.
 */
interface PropsPortable {
    /**
     * Imports props.
     * @param state The state object.
     * @return true if successfully imported.
     */
    importProps: (state: BladeState) => boolean;
    /**
     * Exports props.
     * @return An exported object.
     */
    exportProps: () => BladeState;
}

/**
 * @hidden
 */
interface Config$O<V extends View> {
    blade: Blade;
    view: V;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class BladeController<V extends View = View> implements Controller<V> {
    readonly blade: Blade;
    readonly view: V;
    readonly viewProps: ViewProps;
    private parent_;
    constructor(config: Config$O<V>);
    get parent(): Rack | null;
    set parent(parent: Rack | null);
    /**
     * Import a state from the object.
     * @param state The object to import.
     * @return true if succeeded, false otherwise.
     */
    importState(state: BladeState): boolean;
    /**
     * Export a state to the object.
     * @return A state object.
     */
    exportState(): BladeState;
}

declare class BladeApi<C extends BladeController = BladeController> {
    /**
     * @hidden
     */
    readonly controller: C;
    /**
     * @hidden
     */
    constructor(controller: C);
    get element(): HTMLElement;
    get disabled(): boolean;
    set disabled(disabled: boolean);
    get hidden(): boolean;
    set hidden(hidden: boolean);
    dispose(): void;
    importState(state: BladeState): boolean;
    exportState(): BladeState;
}

interface EventListenable<E> {
    off<EventName extends keyof E>(eventName: EventName, handler: (ev: E[EventName]) => void): this;
    on<EventName extends keyof E>(eventName: EventName, handler: (ev: E[EventName]) => void): this;
}

interface Refreshable {
    /**
     * Refreshes the target.
     */
    refresh(): void;
}

/**
 * A base class for Tweakpane API events.
 * @template Target The event target.
 */
declare class TpEvent<Target = unknown> {
    /**
     * The event dispatcher.
     */
    readonly target: Target;
    /**
     * @hidden
     */
    constructor(target: Target);
}
/**
 * An event class for value changes.
 * @template T The type of the value.
 * @template Target The event target.
 */
declare class TpChangeEvent<T, Target = unknown> extends TpEvent<Target> {
    /**
     * The value.
     */
    readonly value: T;
    /**
     * The flag indicating whether the event is for the last change.
     */
    readonly last: boolean;
    /**
     * @hidden
     */
    constructor(target: Target, value: T, last?: boolean);
}
/**
 * An event class for folder.
 * @template Target The event target.
 */
declare class TpFoldEvent<Target> extends TpEvent<Target> {
    /**
     * The current state of the folder expansion.
     */
    readonly expanded: boolean;
    /**
     * @hidden
     */
    constructor(target: Target, expanded: boolean);
}
/**
 * An event class for tab selection.
 * @template Target The event target.
 */
declare class TpTabSelectEvent<Target> extends TpEvent<Target> {
    /**
     * The selected index of the tab item.
     */
    readonly index: number;
    /**
     * @hidden
     */
    constructor(target: Target, index: number);
}
/**
 * An event class for mouse events.
 * @template Target The event target.
 */
declare class TpMouseEvent<Target> extends TpEvent<Target> {
    /**
     * The native mouse event.
     */
    readonly native: MouseEvent;
    /**
     * @hidden
     */
    constructor(target: Target, nativeEvent: MouseEvent);
}

/**
 * @hidden
 */
interface BindingValue<T> extends Value<T> {
    readonly binding: Binding;
    fetch(): void;
}
declare function isBindingValue(v: unknown): v is BindingValue<unknown>;

/**
 * @hidden
 */
type LabelPropsObject = {
    label: string | null | undefined;
};
/**
 * @hidden
 */
type LabelProps = ValueMap<LabelPropsObject>;
/**
 * @hidden
 */
interface Config$N {
    props: LabelProps;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class LabelView implements View {
    readonly element: HTMLElement;
    readonly labelElement: HTMLElement;
    readonly valueElement: HTMLElement;
    constructor(doc: Document, config: Config$N);
}

/**
 * @hidden
 */
interface Config$M<C extends Controller> {
    blade: Blade;
    props: LabelProps;
    valueController: C;
}
/**
 * @hidden
 */
declare class LabelController<C extends Controller> implements Controller<LabelView>, PropsPortable {
    readonly props: LabelProps;
    readonly valueController: C;
    readonly view: LabelView;
    readonly viewProps: ViewProps;
    constructor(doc: Document, config: Config$M<C>);
    importProps(state: BladeState): boolean;
    exportProps(): BladeState;
}

/**
 * @hidden
 */
interface Config$L<T, C extends ValueController<T>, Va extends Value<T>> {
    blade: Blade;
    props: LabelProps;
    value: Va;
    valueController: C;
}
/**
 * @hidden
 */
type LabeledValueBladeConfig<T, C extends ValueController<T>, Va extends Value<T>> = Config$L<T, C, Va>;
/**
 * @hidden
 */
declare class LabeledValueBladeController<T, C extends ValueController<T> & Partial<PropsPortable> = ValueController<T>, Va extends Value<T> = Value<T>> extends BladeController<LabelView> implements ValueController<T, LabelView, Va> {
    readonly value: Va;
    readonly labelController: LabelController<C>;
    readonly valueController: C;
    constructor(doc: Document, config: Config$L<T, C, Va>);
    importState(state: BladeState): boolean;
    exportState(): BladeState;
}

/**
 * @hidden
 */
interface Config$K<In, Vc extends ValueController<In>, Va extends BindingValue<In>> extends LabeledValueBladeConfig<In, Vc, Va> {
    tag?: string | undefined;
}
/**
 * @hidden
 */
declare class BindingController<In = unknown, Vc extends ValueController<In> = ValueController<In>, Va extends BindingValue<In> = BindingValue<In>> extends LabeledValueBladeController<In, Vc, Va> {
    tag: string | undefined;
    constructor(doc: Document, config: Config$K<In, Vc, Va>);
    importState(state: BladeState): boolean;
    exportState(): BladeState;
}

interface BindingApiEvents<Ex> {
    change: TpChangeEvent<Ex, BindingApi<unknown, Ex>>;
    'internal-change': TpChangeEvent<Ex, BindingApi<unknown, Ex>>;
}
/**
 * The API for binding between the parameter and the pane.
 * @template In The internal type.
 * @template Ex The external type.
 */
declare class BindingApi<In = unknown, Ex = unknown, C extends BindingController<In> = BindingController<In>> extends BladeApi<C> implements EventListenable<BindingApiEvents<Ex>>, Refreshable {
    private readonly emitter_;
    /**
     * @hidden
     */
    constructor(controller: C);
    get label(): string | null | undefined;
    set label(label: string | null | undefined);
    /**
     * The key of the bound value.
     */
    get key(): string;
    /**
     * The generic tag with many uses.
     */
    get tag(): string | undefined;
    set tag(tag: string | undefined);
    on<EventName extends keyof BindingApiEvents<Ex>>(eventName: EventName, handler: (ev: BindingApiEvents<Ex>[EventName]) => void): this;
    off<EventName extends keyof BindingApiEvents<Ex>>(eventName: EventName, handler: (ev: BindingApiEvents<Ex>[EventName]) => void): this;
    refresh(): void;
    private onValueChange_;
}

/**
 * @hidden
 */
interface Config$J<T> {
    reader: BindingReader<T>;
    target: BindingTarget;
    writer: BindingWriter<T>;
}
/**
 * A binding that can read and write the target.
 * @hidden
 * @template In The type of the internal value.
 */
declare class ReadWriteBinding<In> implements Binding {
    readonly target: BindingTarget;
    private readonly reader_;
    private readonly writer_;
    constructor(config: Config$J<In>);
    read(): In;
    write(value: In): void;
    inject(value: unknown): void;
}

/**
 * @hidden
 */
declare class InputBindingValue<T> implements BindingValue<T> {
    readonly binding: ReadWriteBinding<T>;
    readonly emitter: Emitter<ValueEvents<T>>;
    private readonly value_;
    private isInternalChange_;
    constructor(value: Value<T>, binding: ReadWriteBinding<T>);
    get rawValue(): T;
    set rawValue(rawValue: T);
    setRawValue(rawValue: T, options?: ValueChangeOptions | undefined): void;
    fetch(): void;
    push(): void;
    private onValueBeforeChange_;
    private onValueChange_;
}
declare function isInputBindingValue(v: Value<unknown>): v is InputBindingValue<unknown>;

/**
 * @hidden
 */
declare class InputBindingController<In = unknown, Vc extends ValueController<In> = ValueController<In>> extends BindingController<In, Vc, InputBindingValue<In>> {
    importState(state: BladeState): boolean;
}
declare function isInputBindingController(bc: BladeController): bc is InputBindingController;

/**
 * The API for input binding between the parameter and the pane.
 * @template In The internal type.
 * @template Ex The external type.
 */
type InputBindingApi<In = unknown, Ex = unknown> = BindingApi<In, Ex, InputBindingController<In>>;

/**
 * A buffer. Prefixed to avoid conflicts with the Node.js built-in class.
 * @template T
 */
type TpBuffer<T> = (T | undefined)[];
type BufferedValue<T> = Value<TpBuffer<T>>;
type BufferedValueEvents<T> = ValueEvents<TpBuffer<T>>;
declare function initializeBuffer<T>(bufferSize: number): TpBuffer<T>;
declare function createPushedBuffer<T>(buffer: TpBuffer<T>, newValue: T): TpBuffer<T>;

/**
 * @hidden
 */
interface Config$I<T> {
    reader: BindingReader<T>;
    target: BindingTarget;
}
/**
 * A binding that can read the target.
 * @hidden
 * @template In The type of the internal value.
 */
declare class ReadonlyBinding<In> implements Binding {
    readonly target: BindingTarget;
    private readonly reader_;
    constructor(config: Config$I<In>);
    read(): In;
}

/**
 * @hidden
 */
interface TickerEvents {
    tick: {
        sender: Ticker;
    };
}
/**
 * @hidden
 */
interface Ticker {
    readonly emitter: Emitter<TickerEvents>;
    disabled: boolean;
    dispose(): void;
}

/**
 * @hidden
 */
interface Config$H<T> {
    binding: ReadonlyBinding<T>;
    bufferSize: number;
    ticker: Ticker;
}
/**
 * @hidden
 */
declare class MonitorBindingValue<T> implements BindingValue<TpBuffer<T>> {
    readonly binding: ReadonlyBinding<T>;
    readonly emitter: Emitter<BufferedValueEvents<T>>;
    readonly ticker: Ticker;
    private readonly value_;
    constructor(config: Config$H<T>);
    get rawValue(): TpBuffer<T>;
    set rawValue(rawValue: TpBuffer<T>);
    setRawValue(rawValue: TpBuffer<T>, options?: ValueChangeOptions | undefined): void;
    fetch(): void;
    private onTick_;
    private onValueBeforeChange_;
    private onValueChange_;
}
declare function isMonitorBindingValue(v: BufferedValue<unknown>): v is MonitorBindingValue<unknown>;

type BufferedValueController<T, Vw extends View = View> = ValueController<TpBuffer<T>, Vw>;
/**
 * @hidden
 */
declare class MonitorBindingController<T = unknown, Vc extends BufferedValueController<T> = BufferedValueController<T>> extends BindingController<TpBuffer<T>, Vc, MonitorBindingValue<T>> {
    exportState(): BladeState;
}
declare function isMonitorBindingController(bc: BladeController): bc is MonitorBindingController;

/**
 * The API for the monitor binding between the parameter and the pane.
 * @template T
 */
type MonitorBindingApi<T = unknown> = BindingApi<TpBuffer<T>, T, MonitorBindingController<T>>;

/**
 * @hidden
 */
type ButtonPropsObject = {
    title: string | undefined;
};
/**
 * @hidden
 */
type ButtonProps = ValueMap<ButtonPropsObject>;
/**
 * @hidden
 */
interface Config$G {
    props: ButtonProps;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class ButtonView implements View {
    readonly element: HTMLElement;
    readonly buttonElement: HTMLButtonElement;
    constructor(doc: Document, config: Config$G);
}

/**
 * @hidden
 */
interface ButtonEvents {
    click: {
        nativeEvent: MouseEvent;
        sender: ButtonController;
    };
}
/**
 * @hidden
 */
interface Config$F {
    props: ButtonProps;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class ButtonController implements Controller<ButtonView>, PropsPortable {
    readonly emitter: Emitter<ButtonEvents>;
    readonly props: ButtonProps;
    readonly view: ButtonView;
    readonly viewProps: ViewProps;
    /**
     * @hidden
     */
    constructor(doc: Document, config: Config$F);
    importProps(state: BladeState): boolean;
    exportProps(): BladeState;
    private onClick_;
}

/**
 * @hidden
 */
interface Config$E {
    blade: Blade;
    buttonProps: ButtonProps;
    labelProps: LabelProps;
    viewProps: ViewProps;
}
declare class ButtonBladeController extends BladeController<LabelView> {
    readonly buttonController: ButtonController;
    readonly labelController: LabelController<ButtonController>;
    constructor(doc: Document, config: Config$E);
    importState(state: BladeState): boolean;
    exportState(): BladeState;
}

interface ButtonApiEvents {
    click: TpMouseEvent<ButtonApi>;
}
declare class ButtonApi extends BladeApi<ButtonBladeController> implements EventListenable<ButtonApiEvents> {
    get label(): string | null | undefined;
    set label(label: string | null | undefined);
    get title(): string;
    set title(title: string);
    on<EventName extends keyof ButtonApiEvents>(eventName: EventName, handler: (ev: ButtonApiEvents[EventName]) => void): this;
    off<EventName extends keyof ButtonApiEvents>(eventName: EventName, handler: (ev: ButtonApiEvents[EventName]) => void): this;
}

/***
 * A simple semantic versioning perser.
 */
declare class Semver {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly prerelease: string | null;
    /**
     * @hidden
     */
    constructor(text: string);
    toString(): string;
}

type PluginType = 'blade' | 'input' | 'monitor';
/**
 * A base interface of the plugin.
 */
interface BasePlugin {
    /**
     * The identifier of the plugin.
     */
    id: string;
    /**
     * The type of the plugin.
     */
    type: PluginType;
    /**
     * The version of the core used for this plugin.
     */
    core?: Semver;
}
/**
 * Creates a plugin with the current core.
 * @param plugin The plugin without the core version.
 * @return A plugin with the core version.
 */
declare function createPlugin<P extends BasePlugin>(plugin: Omit<P, 'core'>): P;

type Class<T> = new (...args: any[]) => T;
type Tuple2<T> = [T, T];
type Tuple3<T> = [T, T, T];
type Tuple4<T> = [T, T, T, T];
declare function forceCast<T>(v: any): T;
declare function isEmpty<T>(value: T | null | undefined): value is null | undefined;
declare function isObject(value: unknown): value is object;
declare function isRecord(value: unknown): value is Record<string, unknown>;
declare function deepEqualsArray<T>(a1: T[], a2: T[]): boolean;
declare function isPropertyWritable(obj: unknown, key: string): boolean;
declare function deepMerge(r1: Record<string, unknown>, r2: Record<string, unknown>): Record<string, unknown>;

type ColorComponents3 = Tuple3<number>;
type ColorComponents4 = Tuple4<number>;
type ColorMode = 'hsl' | 'hsv' | 'rgb';
type ColorType = 'float' | 'int';

interface BooleanInputParams extends BaseInputParams {
    options?: ListParamsOptions<boolean>;
}
interface ColorInputParams extends BaseInputParams {
    color?: {
        alpha?: boolean;
        type?: ColorType;
    };
    expanded?: boolean;
    picker?: PickerLayout;
}
interface NumberInputParams extends BaseInputParams, NumberTextInputParams {
    options?: ListParamsOptions<number>;
}
interface Point2dYParams extends PointDimensionParams {
    inverted?: boolean;
}
interface Point2dInputParams extends BaseInputParams, PointDimensionParams {
    expanded?: boolean;
    picker?: PickerLayout;
    x?: PointDimensionParams;
    y?: Point2dYParams;
}
interface Point3dInputParams extends BaseInputParams, PointDimensionParams {
    x?: PointDimensionParams;
    y?: PointDimensionParams;
    z?: PointDimensionParams;
}
interface Point4dInputParams extends BaseInputParams, PointDimensionParams {
    x?: PointDimensionParams;
    y?: PointDimensionParams;
    z?: PointDimensionParams;
    w?: PointDimensionParams;
}
interface StringInputParams extends BaseInputParams {
    options?: ListParamsOptions<string>;
}
type InputParams = BooleanInputParams | ColorInputParams | NumberInputParams | Point2dInputParams | Point3dInputParams | Point4dInputParams | StringInputParams;
interface BooleanMonitorParams extends BaseMonitorParams {
    /**
     * Number of rows for visual height.
     */
    rows?: number;
}
interface NumberMonitorParams extends BaseMonitorParams {
    format?: Formatter<number>;
    max?: number;
    min?: number;
    /**
     * Number of rows for visual height.
     */
    rows?: number;
}
interface StringMonitorParams extends BaseMonitorParams {
    multiline?: boolean;
    /**
     * Number of rows for visual height.
     */
    rows?: number;
}
type MonitorParams = BooleanMonitorParams | NumberMonitorParams | StringMonitorParams;
type BindingParams = InputParams | MonitorParams;
interface ButtonParams extends BaseParams {
    title: string;
    label?: string;
}
interface FolderParams extends BaseParams {
    title: string;
    expanded?: boolean;
}
interface TabParams extends BaseParams {
    pages: {
        title: string;
    }[];
}

/**
 * A cache that maps blade controllers and APIs.
 * @hidden
 */
declare class BladeApiCache {
    private map_;
    get(bc: BladeController): BladeApi | null;
    has(bc: BladeController): boolean;
    add(bc: BladeController, api: BladeApi): typeof api;
}

interface Acceptance$2<T, P extends BaseInputParams> {
    initialValue: T;
    params: P;
}
interface BindingArguments$1<Ex, P extends BaseInputParams> {
    initialValue: Ex;
    params: P;
    target: BindingTarget;
}
interface ControllerArguments$2<In, Ex, P extends BaseInputParams> {
    constraint: Constraint<In> | undefined;
    document: Document;
    initialValue: Ex;
    params: P;
    value: Value<In>;
    viewProps: ViewProps;
}
interface ApiArguments$2 {
    controller: InputBindingController<unknown>;
}
/**
 * An input binding plugin interface.
 * @template In The type of the internal value.
 * @template Ex The type of the external value. It will be provided by users.
 * @template P The type of the parameters.
 */
interface InputBindingPlugin<In, Ex, P extends BaseInputParams> extends BasePlugin {
    type: 'input';
    /**
     * Decides whether the plugin accepts the provided value and the parameters.
     */
    accept: {
        /**
         * @param exValue The value input by users.
         * @param params The additional parameters specified by users.
         * @return A typed value if the plugin accepts the input, or null if the plugin sees them off and pass them to the next plugin.
         */
        (exValue: unknown, params: Record<string, unknown>): Acceptance$2<Ex, P> | null;
    };
    /**
     * Configurations of the binding.
     */
    binding: {
        /**
         * Creates a value reader from the user input.
         */
        reader: {
            /**
             * @param args The arguments for binding.
             * @return A value reader.
             */
            (args: BindingArguments$1<Ex, P>): BindingReader<In>;
        };
        /**
         * Creates a value constraint from the user input.
         */
        constraint?: {
            /**
             * @param args The arguments for binding.
             * @return A value constraint.
             */
            (args: BindingArguments$1<Ex, P>): Constraint<In>;
        };
        /**
         * Compares the equality of two internal values.
         * Use `===` for primitive values, or a custom comparator for complex objects.
         */
        equals?: {
            /**
             * @param v1 The value.
             * @param v2 The another value.
             * @return true if equal, false otherwise.
             */
            (v1: In, v2: In): boolean;
        };
        /**
         * Creates a value writer from the user input.
         */
        writer: {
            /**
             * @param args The arguments for binding.
             * @return A value writer.
             */
            (args: BindingArguments$1<Ex, P>): BindingWriter<In>;
        };
    };
    /**
     * Creates a custom controller for the plugin.
     */
    controller: {
        /**
         * @param args The arguments for creating a controller.
         * @return A custom controller that contains a custom view.
         */
        (args: ControllerArguments$2<In, Ex, P>): ValueController<In>;
    };
    /**
     * Creates a custom API for the plugin if available.
     */
    api?: {
        /**
         * @param args The arguments for creating an API.
         * @return A custom API for the specified controller, or null if there is no suitable API.
         */
        (args: ApiArguments$2): InputBindingApi<In, Ex> | null;
    };
}

interface Acceptance$1<T, P extends BaseMonitorParams> {
    initialValue: T;
    params: P;
}
interface BindingArguments<T, P extends BaseMonitorParams> {
    initialValue: T;
    params: P;
    target: BindingTarget;
}
interface ControllerArguments$1<T, P extends BaseMonitorParams> {
    document: Document;
    params: P;
    value: BufferedValue<T>;
    viewProps: ViewProps;
}
interface ApiArguments$1 {
    controller: MonitorBindingController<unknown>;
}
/**
 * A monitor binding plugin interface.
 * @template T The type of the value.
 * @template P The type of the parameters.
 */
interface MonitorBindingPlugin<T, P extends BaseMonitorParams> extends BasePlugin {
    type: 'monitor';
    accept: {
        /**
         * @param exValue The value input by users.
         * @param params The additional parameters specified by users.
         * @return A typed value if the plugin accepts the input, or null if the plugin sees them off and pass them to the next plugin.
         */
        (exValue: unknown, params: Record<string, unknown>): Acceptance$1<T, P> | null;
    };
    /**
     * Configurations of the binding.
     */
    binding: {
        /**
         * Creates a value reader from the user input.
         */
        reader: {
            /**
             * @param args The arguments for binding.
             * @return A value reader.
             */
            (args: BindingArguments<T, P>): BindingReader<T>;
        };
        /**
         * Determinates the default buffer size of the plugin.
         */
        defaultBufferSize?: {
            /**
             * @param params The additional parameters specified by users.
             * @return The default buffer size
             */
            (params: P): number;
        };
    };
    /**
     * Creates a custom controller for the plugin.
     */
    controller: {
        /**
         * @param args The arguments for creating a controller.
         * @return A custom controller that contains a custom view.
         */
        (args: ControllerArguments$1<T, P>): BufferedValueController<T>;
    };
    /**
     * Creates a custom API for the plugin if available.
     */
    api?: {
        /**
         * @param args The arguments for creating an API.
         * @return A custom API for the specified controller, or null if there is no suitable API.
         */
        (args: ApiArguments$1): MonitorBindingApi<T> | null;
    };
}

type TpPlugin = BladePlugin<any> | InputBindingPlugin<any, any, any> | MonitorBindingPlugin<any, any>;
type TpPluginBundle = {
    /**
     * The custom CSS for the bundle.
     */
    css?: string;
    /**
     * The identifier of the bundle.
     */
    id: string;
    plugin: TpPlugin;
} | {
    /**
     * The custom CSS for the bundle.
     */
    css?: string;
    /**
     * The identifier of the bundle.
     */
    id: string;
    plugins: TpPlugin[];
};
declare function createDefaultPluginPool(): PluginPool;

/**
 * @hidden
 */
declare class PluginPool {
    private readonly apiCache_;
    private readonly pluginsMap_;
    constructor(apiCache: BladeApiCache);
    getAll(): TpPlugin[];
    register(bundleId: string, r: TpPlugin): void;
    private createInput_;
    private createMonitor_;
    createBinding(doc: Document, target: BindingTarget, params: BindingParams): BindingController;
    createBlade(document: Document, params: Record<string, unknown>): BladeController;
    private createInputBindingApi_;
    private createMonitorBindingApi_;
    createBindingApi(bc: BindingController): BindingApi;
    createApi(bc: BladeController): BladeApi;
}

interface Acceptance<P extends BaseBladeParams> {
    params: Omit<P, 'disabled' | 'hidden'>;
}
interface ControllerArguments<P extends BaseBladeParams> {
    blade: Blade;
    document: Document;
    params: P;
    viewProps: ViewProps;
}
interface ApiArguments {
    controller: BladeController;
    pool: PluginPool;
}
interface BladePlugin<P extends BaseBladeParams> extends BasePlugin {
    type: 'blade';
    accept: {
        (params: Record<string, unknown>): Acceptance<P> | null;
    };
    controller: {
        (args: ControllerArguments<P>): BladeController;
    };
    api: {
        (args: ApiArguments): BladeApi | null;
    };
}
declare function createBladeController<P extends BaseBladeParams>(plugin: BladePlugin<P>, args: {
    document: Document;
    params: Record<string, unknown>;
}): BladeController | null;

interface ButtonBladeParams extends BaseBladeParams {
    title: string;
    view: 'button';
    label?: string;
}
declare const ButtonBladePlugin: BladePlugin<ButtonBladeParams>;

/**
 * @hidden
 */
interface Config$D {
    blade: Blade;
    element: HTMLElement;
    viewProps: ViewProps;
    root?: boolean;
}
/**
 * @hidden
 */
declare class RackController {
    readonly element: HTMLElement;
    readonly rack: Rack;
    readonly viewProps: ViewProps;
    constructor(config: Config$D);
    private onRackAdd_;
    private onRackRemove_;
}

/**
 * @hidden
 */
interface Config$C<V extends View> {
    blade: Blade;
    rackController: RackController;
    view: V;
}
/**
 * @hidden
 */
declare class ContainerBladeController<V extends View = View> extends BladeController<V> {
    readonly rackController: RackController;
    constructor(config: Config$C<V>);
    importState(state: BladeState): boolean;
    exportState(): BladeState;
}
declare function isContainerBladeController(bc: BladeController): bc is ContainerBladeController;

/**
 * @hidden
 */
declare class Tab {
    readonly empty: Value<boolean>;
    readonly selectedIndex: Value<number>;
    private readonly items_;
    constructor();
    add(item: Value<boolean>, opt_index?: number): void;
    remove(item: Value<boolean>): void;
    private keepSelection_;
    private onItemSelectedChange_;
}

/**
 * @hidden
 */
interface Config$B {
    empty: Value<boolean>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class TabView implements View {
    readonly element: HTMLElement;
    readonly itemsElement: HTMLElement;
    readonly contentsElement: HTMLElement;
    constructor(doc: Document, config: Config$B);
}

/**
 * @hidden
 */
interface Config$A {
    viewName: string;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class PlainView implements View {
    readonly element: HTMLElement;
    /**
     * @hidden
     */
    constructor(doc: Document, config: Config$A);
}

/**
 * @hidden
 */
type TabItemPropsObject = {
    selected: boolean;
    title: string | undefined;
};
/**
 * @hidden
 */
type TabItemProps = ValueMap<TabItemPropsObject>;
/**
 * @hidden
 */
interface Config$z {
    props: TabItemProps;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class TabItemView implements View {
    readonly element: HTMLElement;
    readonly buttonElement: HTMLButtonElement;
    readonly titleElement: HTMLElement;
    constructor(doc: Document, config: Config$z);
}

/**
 * @hidden
 */
interface TabItemEvents {
    click: {
        sender: TabItemController;
    };
}
/**
 * @hidden
 */
interface Config$y {
    props: TabItemProps;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class TabItemController implements Controller<TabItemView> {
    readonly emitter: Emitter<TabItemEvents>;
    readonly props: TabItemProps;
    readonly view: TabItemView;
    readonly viewProps: ViewProps;
    constructor(doc: Document, config: Config$y);
    private onClick_;
}

/**
 * @hidden
 */
type TabPagePropsObject = {
    selected: boolean;
};
/**
 * @hidden
 */
type TabPageProps = ValueMap<TabPagePropsObject>;
/**
 * @hidden
 */
interface Config$x {
    blade: Blade;
    itemProps: TabItemProps;
    props: TabPageProps;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class TabPageController extends ContainerBladeController<PlainView> {
    readonly props: TabPageProps;
    private readonly ic_;
    constructor(doc: Document, config: Config$x);
    get itemController(): TabItemController;
    importState(state: BladeState): boolean;
    exportState(): BladeState;
    private onItemClick_;
}

/**
 * @hidden
 */
interface Config$w {
    blade: Blade;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class TabController extends ContainerBladeController<TabView> {
    readonly tab: Tab;
    constructor(doc: Document, config: Config$w);
    add(pc: TabPageController, opt_index?: number): void;
    remove(index: number): void;
    private onRackAdd_;
    private onRackRemove_;
}

declare class TabPageApi extends ContainerBladeApi<TabPageController> implements ContainerApi {
    get title(): string;
    set title(title: string);
    get selected(): boolean;
    set selected(selected: boolean);
    get children(): BladeApi[];
    addButton(params: ButtonParams): ButtonApi;
    addFolder(params: FolderParams): FolderApi;
    addTab(params: TabParams): TabApi;
    add(api: BladeApi, opt_index?: number): void;
    remove(api: BladeApi): void;
    addBinding<O extends Bindable, Key extends keyof O>(object: O, key: Key, opt_params?: BindingParams): BindingApi<unknown, O[Key]>;
    addBlade(params: BaseBladeParams): BladeApi;
}

interface TabApiEvents {
    change: TpChangeEvent<unknown, BladeApi>;
    select: TpTabSelectEvent<TabApi>;
}
interface TabPageParams {
    title: string;
    index?: number;
}
declare class TabApi extends ContainerBladeApi<TabController> implements EventListenable<TabApiEvents> {
    private readonly emitter_;
    private readonly pool_;
    /**
     * @hidden
     */
    constructor(controller: TabController, pool: PluginPool);
    get pages(): TabPageApi[];
    addPage(params: TabPageParams): TabPageApi;
    removePage(index: number): void;
    on<EventName extends keyof TabApiEvents>(eventName: EventName, handler: (ev: TabApiEvents[EventName]) => void): this;
    off<EventName extends keyof TabApiEvents>(eventName: EventName, handler: (ev: TabApiEvents[EventName]) => void): this;
    private onSelect_;
}

interface ContainerApi extends Refreshable {
    /**
     * Children of the container.
     */
    readonly children: BladeApi[];
    addButton(params: ButtonParams): ButtonApi;
    addFolder(params: FolderParams): FolderApi;
    addTab(params: TabParams): TabApi;
    add(api: BladeApi, opt_index?: number): void;
    remove(api: BladeApi): void;
    /**
     * Creates a new binding and add it to the container.
     * @param object The binding target.
     * @param key The key of the target property.
     * @param opt_params The options of a binding.
     * @return The API object.
     */
    addBinding<O extends Bindable, Key extends keyof O>(object: O, key: Key, opt_params?: BindingParams): BindingApi<unknown, O[Key]>;
    /**
     * Creates a new blade and add it to the container.
     * @param params The options for a blade.
     */
    addBlade(params: BaseBladeParams): BladeApi;
}
declare function addButtonAsBlade(api: ContainerApi, params: ButtonParams): ButtonApi;
declare function addFolderAsBlade(api: ContainerApi, params: FolderParams): FolderApi;
declare function addTabAsBlade(api: ContainerApi, params: TabParams): TabApi;

/**
 * @hidden
 */
type FoldableObject = {
    completed: boolean;
    expanded: boolean;
    expandedHeight: number | null;
    shouldFixHeight: boolean;
    temporaryExpanded: boolean | null;
};
/**
 * @hidden
 */
declare class Foldable extends ValueMap<FoldableObject> {
    constructor(valueMap: {
        [Key in keyof FoldableObject]: Value<FoldableObject[Key]>;
    });
    static create(expanded: boolean): Foldable;
    get styleExpanded(): boolean;
    get styleHeight(): string;
    bindExpandedClass(elem: HTMLElement, expandedClassName: string): void;
    cleanUpTransition(): void;
}
declare function bindFoldable(foldable: Foldable, elem: HTMLElement): void;

/**
 * @hidden
 */
type FolderPropsObject = {
    title: string | undefined;
};
/**
 * @hidden
 */
type FolderProps = ValueMap<FolderPropsObject>;
/**
 * @hidden
 */
interface Config$v {
    foldable: Foldable;
    props: FolderProps;
    viewProps: ViewProps;
    viewName?: string;
}
/**
 * @hidden
 */
declare class FolderView implements View {
    readonly buttonElement: HTMLButtonElement;
    readonly containerElement: HTMLElement;
    readonly titleElement: HTMLElement;
    readonly element: HTMLElement;
    private readonly foldable_;
    private readonly className_;
    constructor(doc: Document, config: Config$v);
}

/**
 * @hidden
 */
interface Config$u {
    expanded?: boolean;
    blade: Blade;
    props: FolderProps;
    viewProps: ViewProps;
    root?: boolean;
}
/**
 * @hidden
 */
declare class FolderController extends ContainerBladeController<FolderView> {
    readonly foldable: Foldable;
    readonly props: FolderProps;
    /**
     * @hidden
     */
    constructor(doc: Document, config: Config$u);
    get document(): Document;
    importState(state: BladeState): boolean;
    exportState(): BladeState;
    private onTitleClick_;
}

interface FolderApiEvents {
    change: TpChangeEvent<unknown, BladeApi>;
    fold: TpFoldEvent<FolderApi>;
}
declare class FolderApi extends ContainerBladeApi<FolderController> implements ContainerApi, EventListenable<FolderApiEvents> {
    private readonly emitter_;
    /**
     * @hidden
     */
    constructor(controller: FolderController, pool: PluginPool);
    get expanded(): boolean;
    set expanded(expanded: boolean);
    get title(): string | undefined;
    set title(title: string | undefined);
    get children(): BladeApi[];
    addBinding<O extends Bindable, Key extends keyof O>(object: O, key: Key, opt_params?: BindingParams): BindingApi<unknown, O[Key]>;
    addFolder(params: FolderParams): FolderApi;
    addButton(params: ButtonParams): ButtonApi;
    addTab(params: TabParams): TabApi;
    add<A extends BladeApi>(api: A, opt_index?: number): A;
    remove(api: BladeApi): void;
    addBlade(params: BaseBladeParams): BladeApi;
    /**
     * Adds a global event listener. It handles all events of child inputs/monitors.
     * @param eventName The event name to listen.
     * @param handler The event handler.
     * @return The API object itself.
     */
    on<EventName extends keyof FolderApiEvents>(eventName: EventName, handler: (ev: FolderApiEvents[EventName]) => void): this;
    /**
     * Removes a global event listener.
     * @param eventName The event name to listen.
     * @param handler The event handler.
     * @returns The API object itself.
     */
    off<EventName extends keyof FolderApiEvents>(eventName: EventName, handler: (ev: FolderApiEvents[EventName]) => void): this;
}

/**
 * @hidden
 */
interface RackApiEvents {
    change: TpChangeEvent<unknown, BladeApi>;
}
/**
 * @hidden
 */
declare class RackApi implements ContainerApi, EventListenable<RackApiEvents> {
    private readonly controller_;
    private readonly emitter_;
    private readonly pool_;
    constructor(controller: RackController, pool: PluginPool);
    get children(): BladeApi[];
    addBinding<O extends Bindable, Key extends keyof O>(object: O, key: Key, opt_params?: BindingParams): BindingApi<unknown, O[Key]>;
    addFolder(params: FolderParams): FolderApi;
    addButton(params: ButtonParams): ButtonApi;
    addTab(params: TabParams): TabApi;
    add<A extends BladeApi>(api: A, opt_index?: number): A;
    remove(api: BladeApi): void;
    addBlade(params: BaseBladeParams): BladeApi;
    on<EventName extends keyof RackApiEvents>(eventName: EventName, handler: (ev: RackApiEvents[EventName]) => void): this;
    off<EventName extends keyof RackApiEvents>(eventName: EventName, handler: (ev: RackApiEvents[EventName]) => void): this;
    refresh(): void;
    private onRackValueChange_;
}

declare class ContainerBladeApi<C extends ContainerBladeController> extends BladeApi<C> implements Refreshable {
    /**
     * @hidden
     */
    protected readonly rackApi_: RackApi;
    /**
     * @hidden
     */
    constructor(controller: C, pool: PluginPool);
    refresh(): void;
}
declare function isContainerBladeApi(api: BladeApi): api is ContainerBladeApi<ContainerBladeController>;

interface ApiChangeEvents<T> {
    change: TpChangeEvent<T, BladeApi>;
}

declare function isValueBladeController(bc: BladeController): bc is BladeController & ValueController<unknown>;

interface FolderBladeParams extends BaseBladeParams {
    title: string;
    view: 'folder';
    expanded?: boolean;
}
declare const FolderBladePlugin: BladePlugin<FolderBladeParams>;

interface TabBladeParams extends BaseBladeParams {
    pages: {
        title: string;
    }[];
    view: 'tab';
}
declare const TabBladePlugin: BladePlugin<TabBladeParams>;

interface ListItem<T> {
    text: string;
    value: T;
}
/**
 * A list constranit.
 * @template T The type of the value.
 */
declare class ListConstraint<T> implements Constraint<T> {
    readonly values: ValueMap<{
        options: ListItem<T>[];
    }>;
    constructor(options: ListItem<T>[]);
    constrain(value: T): T;
}

/**
 * @hidden
 */
type ListProps<T> = ValueMap<{
    options: ListItem<T>[];
}>;
/**
 * @hidden
 */
interface Config$t<T> {
    props: ListProps<T>;
    value: Value<T>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class ListView<T> implements View {
    readonly selectElement: HTMLSelectElement;
    readonly element: HTMLElement;
    private readonly value_;
    private readonly props_;
    constructor(doc: Document, config: Config$t<T>);
    private update_;
    private onValueChange_;
}

/**
 * @hidden
 */
interface Config$s<T> {
    props: ListProps<T>;
    value: Value<T>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class ListController<T> implements ValueController<T, ListView<T>>, PropsPortable {
    readonly value: Value<T>;
    readonly view: ListView<T>;
    readonly props: ListProps<T>;
    readonly viewProps: ViewProps;
    constructor(doc: Document, config: Config$s<T>);
    private onSelectChange_;
    importProps(state: BladeState): boolean;
    exportProps(): BladeState;
}

declare class ListInputBindingApi<T> extends BindingApi<T, T, InputBindingController<T, ListController<T>>> implements InputBindingApi<T, T> {
    get options(): ListItem<T>[];
    set options(options: ListItem<T>[]);
}

/**
 * @hidden
 */
declare class ManualTicker implements Ticker {
    readonly emitter: Emitter<TickerEvents>;
    disabled: boolean;
    constructor();
    dispose(): void;
    tick(): void;
}

/**
 * @hidden
 */
declare class IntervalTicker implements Ticker {
    readonly emitter: Emitter<TickerEvents>;
    private readonly interval_;
    private readonly doc_;
    private disabled_;
    private timerId_;
    constructor(doc: Document, interval: number);
    get disabled(): boolean;
    set disabled(inactive: boolean);
    dispose(): void;
    private clearTimer_;
    private setTimer_;
    private onTick_;
}

/**
 * A constraint to combine multiple constraints.
 * @template T The type of the value.
 */
declare class CompositeConstraint<T> implements Constraint<T> {
    readonly constraints: Constraint<T>[];
    constructor(constraints: Constraint<T>[]);
    constrain(value: T): T;
}
declare function findConstraint<C>(c: Constraint<unknown>, constraintClass: Class<C>): C | null;

interface Config$r {
    max: number;
    min: number;
}
/**
 * A number range constraint that cannot be undefined. Used for slider control.
 */
declare class DefiniteRangeConstraint implements Constraint<number> {
    readonly values: ValueMap<{
        max: number;
        min: number;
    }>;
    constructor(config: Config$r);
    constrain(value: number): number;
}

interface Config$q {
    max?: number;
    min?: number;
}
/**
 * A number range constraint.
 */
declare class RangeConstraint implements Constraint<number> {
    readonly values: ValueMap<{
        max: number | undefined;
        min: number | undefined;
    }>;
    constructor(config: Config$q);
    constrain(value: number): number;
}

/**
 * A number step range constraint.
 */
declare class StepConstraint implements Constraint<number> {
    readonly step: number;
    readonly origin: number;
    constructor(step: number, origin?: number);
    constrain(value: number): number;
}

interface Config$p {
    shows: Value<boolean>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class PopupView implements View {
    readonly element: HTMLElement;
    constructor(doc: Document, config: Config$p);
}

interface Config$o {
    viewProps: ViewProps;
}
declare class PopupController implements Controller<PopupView> {
    readonly shows: Value<boolean>;
    readonly view: PopupView;
    readonly viewProps: ViewProps;
    constructor(doc: Document, config: Config$o);
}

type Parser<T> = (text: string) => T | null;
declare function composeParsers<T>(parsers: Parser<T>[]): Parser<T>;

/**
 * @hidden
 */
type TextProps<T> = ValueMap<{
    formatter: Formatter<T>;
}>;
/**
 * @hidden
 */
interface Config$n<T> {
    props: TextProps<T>;
    value: Value<T>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class TextView<T> implements View, InputView {
    readonly inputElement: HTMLInputElement;
    readonly element: HTMLElement;
    private readonly props_;
    private readonly value_;
    constructor(doc: Document, config: Config$n<T>);
    refresh(): void;
    private onChange_;
}

/**
 * @hidden
 */
interface Config$m<T> {
    props: TextProps<T>;
    parser: Parser<T>;
    value: Value<T>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class TextController<T> implements ValueController<T, TextView<T>> {
    readonly props: TextProps<T>;
    readonly value: Value<T>;
    readonly view: TextView<T>;
    readonly viewProps: ViewProps;
    private readonly parser_;
    constructor(doc: Document, config: Config$m<T>);
    private onInputChange_;
}

declare function boolToString(value: boolean): string;
declare function boolFromUnknown(value: unknown): boolean;
declare function BooleanFormatter(value: boolean): string;

declare function parseNumber(text: string): number | null;
declare function numberFromUnknown(value: unknown): number;
declare function numberToString(value: number): string;
declare function createNumberFormatter(digits: number): Formatter<number>;

declare function formatPercentage(value: number): string;

declare function stringFromUnknown(value: unknown): string;
declare function formatString(value: string): string;

declare function bindValue<T>(value: Value<T> | ReadonlyValue<T>, applyValue: (value: T) => void): void;
declare function bindValueMap<O extends Record<string, unknown>, Key extends keyof O>(valueMap: ValueMap<O>, key: Key, applyValue: (value: O[Key]) => void): void;

/**
 * Synchronizes two values.
 */
declare function connectValues<T1, T2>({ primary, secondary, forward, backward, }: {
    primary: Value<T1>;
    secondary: Value<T2>;
    forward: (primary: T1, secondary: T2) => T2;
    backward: (primary: T1, secondary: T2) => T1;
}): void;

interface Config$l<T> {
    constraint?: Constraint<T>;
    equals?: (v1: T, v2: T) => boolean;
}
declare function createValue<T>(initialValue: T, config?: Config$l<T>): Value<T>;
type SetRawValue<T> = (rawValue: T, options?: ValueChangeOptions | undefined) => void;
declare function createReadonlyValue<T>(value: Value<T>): [ReadonlyValue<T>, SetRawValue<T>];

/**
 * @hidden
 */
type SliderPropsObject = {
    keyScale: number;
    max: number;
    min: number;
};
/**
 * @hidden
 */
type SliderProps = ValueMap<SliderPropsObject>;
/**
 * @hidden
 */
interface Config$k {
    props: SliderProps;
    value: Value<number>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class SliderView implements View {
    readonly element: HTMLElement;
    readonly knobElement: HTMLDivElement;
    readonly trackElement: HTMLDivElement;
    readonly value: Value<number>;
    private readonly props_;
    constructor(doc: Document, config: Config$k);
    private update_;
    private onChange_;
}

/**
 * @hidden
 */
interface Config$j {
    parser: Parser<number>;
    props: NumberTextProps;
    sliderProps?: SliderProps;
    value: Value<number>;
    viewProps: ViewProps;
    arrayPosition?: 'fst' | 'mid' | 'lst';
}
/**
 * @hidden
 */
declare class NumberTextController implements ValueController<number, NumberTextView> {
    readonly props: NumberTextProps;
    readonly value: Value<number>;
    readonly view: NumberTextView;
    readonly viewProps: ViewProps;
    private readonly sliderProps_;
    private readonly parser_;
    private readonly dragging_;
    private originRawValue_;
    constructor(doc: Document, config: Config$j);
    private constrainValue_;
    private onInputChange_;
    private onInputKeyDown_;
    private onInputKeyUp_;
    private onPointerDown_;
    private computeDraggingValue_;
    private onPointerMove_;
    private onPointerUp_;
}

/**
 * @hidden
 */
interface Config$i {
    props: SliderProps;
    value: Value<number>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class SliderController implements ValueController<number, SliderView> {
    readonly value: Value<number>;
    readonly view: SliderView;
    readonly viewProps: ViewProps;
    readonly props: SliderProps;
    private readonly ptHandler_;
    constructor(doc: Document, config: Config$i);
    private handlePointerEvent_;
    private onPointerDownOrMove_;
    private onPointerUp_;
    private onKeyDown_;
    private onKeyUp_;
}

/**
 * @hidden
 */
interface Config$h {
    sliderView: SliderView;
    textView: NumberTextView;
}
/**
 * @hidden
 */
declare class SliderTextView implements View {
    readonly element: HTMLElement;
    private readonly sliderView_;
    private readonly textView_;
    constructor(doc: Document, config: Config$h);
}

/**
 * @hidden
 */
interface Config$g {
    parser: Parser<number>;
    sliderProps: SliderProps;
    textProps: NumberTextProps;
    value: Value<number>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class SliderTextController implements ValueController<number, SliderTextView>, PropsPortable {
    readonly value: Value<number>;
    readonly view: SliderTextView;
    readonly viewProps: ViewProps;
    private readonly sliderC_;
    private readonly textC_;
    constructor(doc: Document, config: Config$g);
    get sliderController(): SliderController;
    get textController(): NumberTextController;
    importProps(state: BladeState): boolean;
    exportProps(): BladeState;
}
declare function createSliderTextProps(config: {
    formatter: Formatter<number>;
    keyScale: Value<number>;
    max: Value<number>;
    min: Value<number>;
    pointerScale: number;
}): {
    sliderProps: SliderProps;
    textProps: NumberTextProps;
};

/**
 * A utility function for generating BEM-like class name.
 * @param viewName The name of the view. Used as part of the block name.
 * @return A class name generator function.
 */
declare function ClassName(viewName: string): (opt_elementName?: string, opt_modifier?: string) => string;

declare const CSS_VAR_MAP: {
    containerUnitSize: string;
};
/**
 * Gets a name of the internal CSS variable.
 * @param key The key for the CSS variable.
 * @return A name of the internal CSS variable.
 */
declare function getCssVar(key: keyof typeof CSS_VAR_MAP): string;

/**
 * Data for pointer events.
 */
interface PointerData {
    /**
     * The size of the bounds.
     */
    bounds: {
        height: number;
        width: number;
    };
    /**
     * The pointer coordinates.
     */
    point: {
        /**
         * The X coordinate in the element.
         */
        x: number;
        /**
         * The Y coordinate in the element.
         */
        y: number;
    } | null;
}
/**
 * An event for PointerHandler.
 */
interface PointerHandlerEvent {
    altKey: boolean;
    data: PointerData;
    shiftKey: boolean;
    sender: PointerHandler;
}
interface PointerHandlerEvents {
    down: PointerHandlerEvent;
    move: PointerHandlerEvent;
    up: PointerHandlerEvent;
}
/**
 * A utility class to handle both mouse and touch events.
 */
declare class PointerHandler {
    readonly emitter: Emitter<PointerHandlerEvents>;
    private readonly elem_;
    private lastTouch_;
    /**
     * @hidden
     */
    constructor(element: HTMLElement);
    private computePosition_;
    private onMouseDown_;
    private onDocumentMouseMove_;
    private onDocumentMouseUp_;
    private onTouchStart_;
    private onTouchMove_;
    private onTouchEnd_;
}

declare function valueToClassName(elem: HTMLElement, className: string): (value: boolean) => void;
declare function bindValueToTextContent(value: Value<string | undefined>, elem: HTMLElement): void;

declare function mapRange(value: number, start1: number, end1: number, start2: number, end2: number): number;
declare function getDecimalDigits(value: number): number;
declare function constrainRange(value: number, min: number, max: number): number;
declare function loopRange(value: number, max: number): number;
declare function getSuitableDecimalDigits(params: NumberTextInputParams, rawValue: number): number;
declare function getSuitableKeyScale(params: NumberTextInputParams): number;
declare function getSuitablePointerScale(params: NumberTextInputParams, rawValue: number): number;
/**
 * Tries to create a step constraint.
 * @param params The input parameters object.
 * @return A constraint or null if not found.
 */
declare function createStepConstraint(params: {
    step?: number;
}, initialValue?: number): Constraint<number> | null;
/**
 * Tries to create a range constraint.
 * @param params The input parameters object.
 * @return A constraint or null if not found.
 */
declare function createRangeConstraint(params: {
    max?: number;
    min?: number;
}): Constraint<number> | null;
declare function createNumberTextPropsObject(params: NumberTextInputParams, initialValue: number): NumberTextPropsObject;
declare function createNumberTextInputParamsParser(p: typeof MicroParsers): {
    format: MicroParser<Formatter<number>>;
    keyScale: MicroParser<number>;
    max: MicroParser<number>;
    min: MicroParser<number>;
    pointerScale: MicroParser<number>;
    step: MicroParser<number>;
};

declare function createPointDimensionParser(p: typeof MicroParsers): {
    format: MicroParser<Formatter<number>>;
    keyScale: MicroParser<number>;
    max: MicroParser<number>;
    min: MicroParser<number>;
    pointerScale: MicroParser<number>;
    step: MicroParser<number>;
};
declare function parsePointDimensionParams(value: unknown): PointDimensionParams | undefined;
declare function createDimensionConstraint(params: PointDimensionParams | undefined, initialValue: number): Constraint<number> | undefined;

declare function warnDeprecation(info: {
    name: string;
    alternative?: string;
    postscript?: string;
}): void;
declare function warnMissing(info: {
    key: string;
    target: string;
    place: string;
}): void;
declare function isCompatible(ver: Semver | undefined): boolean;

declare const SVG_NS = "http://www.w3.org/2000/svg";
declare function forceReflow(element: HTMLElement): void;
declare function disableTransitionTemporarily(element: HTMLElement, callback: () => void): void;
declare function supportsTouch(doc: Document): boolean;
declare function getWindowDocument(): Document;
declare function getCanvasContext(canvasElement: HTMLCanvasElement): CanvasRenderingContext2D | null;
declare const ICON_ID_TO_INNER_HTML_MAP: {
    [key in string]: string;
};
type IconId = keyof typeof ICON_ID_TO_INNER_HTML_MAP;
declare function createSvgIconElement(document: Document, iconId: IconId): Element;
declare function insertElementAt(parentElement: Element, element: Element, index: number): void;
declare function removeElement(element: Element): void;
declare function removeChildElements(element: Element): void;
declare function removeChildNodes(element: Element): void;
declare function indexOfChildElement(element: Element): number;
declare function findNextTarget(ev: FocusEvent): HTMLElement | null;

declare function parseListOptions<T>(value: unknown): ListParamsOptions<T> | undefined;
declare function normalizeListOptions<T>(options: ArrayStyleListOptions<T> | ObjectStyleListOptions<T>): ListItem<T>[];
/**
 * Tries to create a list constraint.
 * @template T The type of the raw value.
 * @param options The list options.
 * @return A constraint or null if not found.
 */
declare function createListConstraint<T>(options: ListParamsOptions<T> | undefined): ListConstraint<T> | null;

declare function parsePickerLayout(value: unknown): PickerLayout | undefined;

/**
 * The union of primitive types.
 */
type Primitive = boolean | number | string;
/**
 * Writes the primitive value.
 * @param target The target to be written.
 * @param value The value to write.
 */
declare function writePrimitive<T extends Primitive>(target: BindingTarget, value: T): void;

interface ErrorContext {
    alreadydisposed: undefined;
    invalidparams: {
        name: string;
    };
    nomatchingcontroller: {
        key: string;
    };
    nomatchingview: {
        params: Record<string, unknown>;
    };
    notbindable: undefined;
    notcompatible: {
        id: string;
    };
    propertynotfound: {
        name: string;
    };
    shouldneverhappen: undefined;
}
type ErrorType = keyof ErrorContext;
interface Config$f<T extends ErrorType> {
    context?: ErrorContext[T];
    type: T;
}
declare class TpError<T extends ErrorType> {
    static alreadyDisposed(): TpError<'alreadydisposed'>;
    static notBindable(): TpError<'notbindable'>;
    static notCompatible(bundleId: string, id: string): TpError<'notcompatible'>;
    static propertyNotFound(name: string): TpError<'propertynotfound'>;
    static shouldNeverHappen(): TpError<'shouldneverhappen'>;
    readonly message: string;
    readonly name: string;
    readonly stack?: string;
    readonly type: ErrorType;
    constructor(config: Config$f<T>);
    toString(): string;
}

interface StepKeys {
    altKey: boolean;
    downKey: boolean;
    shiftKey: boolean;
    upKey: boolean;
}
declare function getStepForKey(keyScale: number, keys: StepKeys): number;
declare function getVerticalStepKeys(ev: KeyboardEvent): StepKeys;
declare function getHorizontalStepKeys(ev: KeyboardEvent): StepKeys;
declare function isVerticalArrowKey(key: string): boolean;
declare function isArrowKey(key: string): boolean;

interface Config$e {
    value: Value<boolean>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class CheckboxView implements View {
    readonly element: HTMLElement;
    readonly inputElement: HTMLInputElement;
    readonly labelElement: HTMLLabelElement;
    readonly value: Value<boolean>;
    constructor(doc: Document, config: Config$e);
    private update_;
    private onValueChange_;
}

/**
 * @hidden
 */
interface Config$d {
    value: Value<boolean>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class CheckboxController implements ValueController<boolean, CheckboxView> {
    readonly value: Value<boolean>;
    readonly view: CheckboxView;
    readonly viewProps: ViewProps;
    constructor(doc: Document, config: Config$d);
    private onInputChange_;
    private onLabelMouseDown_;
}

/**
 * @hidden
 */
declare const BooleanInputPlugin: InputBindingPlugin<boolean, boolean, BooleanInputParams>;

interface RgbColorObject {
    r: number;
    g: number;
    b: number;
}
interface RgbaColorObject {
    r: number;
    g: number;
    b: number;
    a: number;
}
declare function isRgbColorObject(obj: unknown): obj is RgbColorObject;
declare function isRgbaColorObject(obj: unknown): obj is RgbaColorObject;
declare function isColorObject(obj: unknown): obj is RgbColorObject | RgbaColorObject;
interface Color {
    readonly mode: ColorMode;
    readonly type: ColorType;
    getComponents(opt_mode?: ColorMode): ColorComponents4;
    toRgbaObject(): RgbaColorObject;
}
declare function equalsColor(v1: Color, v2: Color): boolean;
declare function createColorComponentsFromRgbObject(obj: RgbColorObject | RgbaColorObject): ColorComponents3 | ColorComponents4;

declare class IntColor implements Color {
    static black(): IntColor;
    private readonly comps_;
    readonly mode: ColorMode;
    readonly type: ColorType;
    constructor(comps: ColorComponents3 | ColorComponents4, mode: ColorMode);
    getComponents(opt_mode?: ColorMode): ColorComponents4;
    toRgbaObject(): RgbaColorObject;
}

interface Config$c {
    foldable: Foldable;
    pickerLayout: PickerLayout;
}
/**
 * @hidden
 */
declare class ColorView implements View {
    readonly element: HTMLElement;
    readonly swatchElement: HTMLElement;
    readonly textElement: HTMLElement;
    readonly pickerElement: HTMLElement | null;
    constructor(doc: Document, config: Config$c);
}

interface Config$b {
    colorType: ColorType;
    expanded: boolean;
    formatter: Formatter<IntColor>;
    parser: Parser<IntColor>;
    pickerLayout: PickerLayout;
    supportsAlpha: boolean;
    value: Value<IntColor>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class ColorController implements ValueController<IntColor, ColorView> {
    readonly value: Value<IntColor>;
    readonly view: ColorView;
    readonly viewProps: ViewProps;
    private readonly swatchC_;
    private readonly textC_;
    private readonly pickerC_;
    private readonly popC_;
    private readonly foldable_;
    constructor(doc: Document, config: Config$b);
    get textController(): TextController<IntColor>;
    private onButtonBlur_;
    private onButtonClick_;
    private onPopupChildBlur_;
    private onPopupChildKeydown_;
}

declare function colorToRgbNumber(value: IntColor): number;
declare function colorToRgbaNumber(value: IntColor): number;
declare function numberToRgbColor(num: number): IntColor;
declare function numberToRgbaColor(num: number): IntColor;
declare function colorFromRgbNumber(value: unknown): IntColor;
declare function colorFromRgbaNumber(value: unknown): IntColor;

declare class FloatColor implements Color {
    private readonly comps_;
    readonly mode: ColorMode;
    readonly type: ColorType;
    constructor(comps: ColorComponents3 | ColorComponents4, mode: ColorMode);
    getComponents(opt_mode?: ColorMode): ColorComponents4;
    toRgbaObject(): RgbaColorObject;
}

type StringColorNotation = 'func' | 'hex' | 'object';
interface StringColorFormat {
    alpha: boolean;
    mode: ColorMode;
    notation: StringColorNotation;
    type: ColorType;
}
declare function detectStringColorFormat(text: string, type?: ColorType): StringColorFormat | null;
declare function createColorStringParser(type: 'int'): Parser<IntColor>;
declare function createColorStringParser(type: 'float'): Parser<FloatColor>;
declare function readIntColorString(value: unknown): IntColor;
declare function colorToHexRgbString(value: IntColor, prefix?: string): string;
declare function colorToHexRgbaString(value: IntColor, prefix?: string): string;
declare function colorToFunctionalRgbString(value: Color): string;
declare function colorToFunctionalRgbaString(value: Color): string;
declare function colorToFunctionalHslString(value: Color): string;
declare function colorToFunctionalHslaString(value: Color): string;
declare function colorToObjectRgbString(value: Color, type: ColorType): string;
declare function colorToObjectRgbaString(value: Color, type: ColorType): string;
declare function findColorStringifier(format: StringColorFormat): Formatter<Color> | null;

interface NumberColorInputParams extends ColorInputParams {
    supportsAlpha: boolean;
}
/**
 * @hidden
 */
declare const NumberColorInputPlugin: InputBindingPlugin<IntColor, number, NumberColorInputParams>;

interface ObjectColorInputParams extends ColorInputParams {
    colorType: ColorType;
}
/**
 * @hidden
 */
declare const ObjectColorInputPlugin: InputBindingPlugin<IntColor, RgbColorObject | RgbaColorObject, ObjectColorInputParams>;

interface StringColorInputParams extends ColorInputParams {
    format: StringColorFormat;
    stringifier: Formatter<Color>;
}
/**
 * @hidden
 */
declare const StringColorInputPlugin: InputBindingPlugin<IntColor, string, StringColorInputParams>;

interface PointNdAssembly<PointNd> {
    toComponents: (p: PointNd) => number[];
    fromComponents: (comps: number[]) => PointNd;
}

interface Config$a<PointNd> {
    assembly: PointNdAssembly<PointNd>;
    components: (Constraint<number> | undefined)[];
}
/**
 * @hidden
 */
declare class PointNdConstraint<PointNd> implements Constraint<PointNd> {
    readonly components: (Constraint<number> | undefined)[];
    private readonly asm_;
    constructor(config: Config$a<PointNd>);
    constrain(value: PointNd): PointNd;
}

interface Config$9 {
    textViews: NumberTextView[];
}
/**
 * @hidden
 */
declare class PointNdTextView implements View {
    readonly element: HTMLElement;
    readonly textViews: NumberTextView[];
    constructor(doc: Document, config: Config$9);
}

interface Config$8<PointNd> {
    assembly: PointNdAssembly<PointNd>;
    axes: PointAxis[];
    parser: Parser<number>;
    value: Value<PointNd>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class PointNdTextController<PointNd> implements ValueController<PointNd, PointNdTextView> {
    readonly value: Value<PointNd>;
    readonly view: PointNdTextView;
    readonly viewProps: ViewProps;
    private readonly acs_;
    constructor(doc: Document, config: Config$8<PointNd>);
    get textControllers(): NumberTextController[];
}

declare class SliderInputBindingApi extends BindingApi<number, number, InputBindingController<number, SliderTextController>> implements InputBindingApi<number, number> {
    get max(): number;
    set max(max: number);
    get min(): number;
    set min(max: number);
}

/**
 * @hidden
 */
declare const NumberInputPlugin: InputBindingPlugin<number, number, NumberInputParams>;

interface Point2dObject {
    x: number;
    y: number;
}
declare class Point2d {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    getComponents(): [number, number];
    static isObject(obj: any): obj is Point2dObject;
    static equals(v1: Point2d, v2: Point2d): boolean;
    toObject(): Point2dObject;
}

interface Config$7 {
    expanded: Value<boolean>;
    pickerLayout: PickerLayout;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class Point2dView implements View {
    readonly element: HTMLElement;
    readonly buttonElement: HTMLButtonElement;
    readonly textElement: HTMLElement;
    readonly pickerElement: HTMLElement | null;
    constructor(doc: Document, config: Config$7);
}

interface Config$6 {
    axes: Tuple2<PointAxis>;
    expanded: boolean;
    invertsY: boolean;
    max: number;
    parser: Parser<number>;
    pickerLayout: PickerLayout;
    value: Value<Point2d>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class Point2dController implements ValueController<Point2d, Point2dView> {
    readonly value: Value<Point2d>;
    readonly view: Point2dView;
    readonly viewProps: ViewProps;
    private readonly popC_;
    private readonly pickerC_;
    private readonly textC_;
    private readonly foldable_;
    constructor(doc: Document, config: Config$6);
    get textController(): PointNdTextController<Point2d>;
    private onPadButtonBlur_;
    private onPadButtonClick_;
    private onPopupChildBlur_;
    private onPopupChildKeydown_;
}

declare function getSuitableMax(params: Point2dInputParams, initialValue: Point2d): number;
/**
 * @hidden
 */
declare const Point2dInputPlugin: InputBindingPlugin<Point2d, Point2dObject, Point2dInputParams>;

interface Point3dObject {
    x: number;
    y: number;
    z: number;
}
declare class Point3d {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    getComponents(): [number, number, number];
    static isObject(obj: any): obj is Point3dObject;
    static equals(v1: Point3d, v2: Point3d): boolean;
    toObject(): Point3dObject;
}

/**
 * @hidden
 */
declare const Point3dInputPlugin: InputBindingPlugin<Point3d, Point3dObject, Point3dInputParams>;

interface Point4dObject {
    x: number;
    y: number;
    z: number;
    w: number;
}
declare class Point4d {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    getComponents(): Tuple4<number>;
    static isObject(obj: any): obj is Point4dObject;
    static equals(v1: Point4d, v2: Point4d): boolean;
    toObject(): Point4dObject;
}

/**
 * @hidden
 */
declare const Point4dInputPlugin: InputBindingPlugin<Point4d, Point4dObject, Point4dInputParams>;

/**
 * @hidden
 */
declare const StringInputPlugin: InputBindingPlugin<string, string, StringInputParams>;

declare const Constants: {
    monitor: {
        defaultInterval: number;
        defaultRows: number;
    };
};

/**
 * @hidden
 */
declare const BooleanMonitorPlugin: MonitorBindingPlugin<boolean, BooleanMonitorParams>;

interface Config$5<T> {
    formatter: Formatter<T>;
    rows: number;
    value: BufferedValue<T>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class MultiLogView<T> implements View {
    readonly element: HTMLElement;
    readonly value: BufferedValue<T>;
    private readonly formatter_;
    private readonly textareaElem_;
    constructor(doc: Document, config: Config$5<T>);
    private update_;
    private onValueUpdate_;
}

interface Config$4<T> {
    formatter: Formatter<T>;
    rows: number;
    value: BufferedValue<T>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class MultiLogController<T> implements BufferedValueController<T, MultiLogView<T>> {
    readonly value: BufferedValue<T>;
    readonly view: MultiLogView<T>;
    readonly viewProps: ViewProps;
    constructor(doc: Document, config: Config$4<T>);
}

interface Config$3<T> {
    formatter: Formatter<T>;
    value: BufferedValue<T>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class SingleLogView<T> implements View {
    readonly element: HTMLElement;
    readonly inputElement: HTMLInputElement;
    readonly value: BufferedValue<T>;
    private readonly formatter_;
    constructor(doc: Document, config: Config$3<T>);
    private update_;
    private onValueUpdate_;
}

interface Config$2<T> {
    formatter: Formatter<T>;
    value: BufferedValue<T>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class SingleLogController<T> implements BufferedValueController<T, SingleLogView<T>> {
    readonly value: BufferedValue<T>;
    readonly view: SingleLogView<T>;
    readonly viewProps: ViewProps;
    constructor(doc: Document, config: Config$2<T>);
}

type GraphLogProps = ValueMap<{
    max: number;
    min: number;
}>;
interface Config$1 {
    cursor: Value<number>;
    formatter: Formatter<number>;
    props: GraphLogProps;
    rows: number;
    value: BufferedValue<number>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class GraphLogView implements View {
    readonly element: HTMLElement;
    readonly value: BufferedValue<number>;
    private readonly props_;
    private readonly cursor_;
    private readonly formatter_;
    private readonly lineElem_;
    private readonly svgElem_;
    private readonly tooltipElem_;
    constructor(doc: Document, config: Config$1);
    get graphElement(): Element;
    private update_;
    private onValueUpdate_;
    private onCursorChange_;
}

interface Config {
    formatter: Formatter<number>;
    props: GraphLogProps;
    rows: number;
    value: BufferedValue<number>;
    viewProps: ViewProps;
}
/**
 * @hidden
 */
declare class GraphLogController implements BufferedValueController<number, GraphLogView>, PropsPortable {
    readonly props: GraphLogProps;
    readonly value: BufferedValue<number>;
    readonly view: GraphLogView;
    readonly viewProps: ViewProps;
    private readonly cursor_;
    constructor(doc: Document, config: Config);
    importProps(state: BladeState): boolean;
    exportProps(): BladeState;
    private onGraphMouseLeave_;
    private onGraphMouseMove_;
    private onGraphPointerDown_;
    private onGraphPointerMove_;
    private onGraphPointerUp_;
}

declare class GraphLogMonitorBindingApi extends BindingApi<TpBuffer<number>, number, MonitorBindingController<number, GraphLogController>> implements MonitorBindingApi<number> {
    get max(): number;
    set max(max: number);
    get min(): number;
    set min(min: number);
}

/**
 * @hidden
 */
declare const NumberMonitorPlugin: MonitorBindingPlugin<number, NumberMonitorParams>;

/**
 * @hidden
 */
declare const StringMonitorPlugin: MonitorBindingPlugin<string, StringMonitorParams>;

declare const VERSION: Semver;

export { BindingApi, BindingTarget, BladeApi, BladeController, BooleanFormatter, BooleanInputPlugin, BooleanMonitorPlugin, ButtonApi, ButtonBladeController, ButtonBladePlugin, ButtonController, ButtonView, CheckboxController, ClassName, ColorController, CompositeConstraint, Constants, ContainerBladeApi, ContainerBladeController, DefiniteRangeConstraint, Emitter, FloatColor, Foldable, FolderApi, FolderBladePlugin, FolderController, FolderView, GraphLogController, GraphLogMonitorBindingApi, InputBindingController, InputBindingValue, IntColor, IntervalTicker, LabelController, LabelView, LabeledValueBladeController, ListConstraint, ListController, ListInputBindingApi, ListView, ManualTicker, MicroParsers, MonitorBindingController, MonitorBindingValue, MultiLogController, NumberColorInputPlugin, NumberInputPlugin, NumberMonitorPlugin, NumberTextController, NumberTextView, ObjectColorInputPlugin, PlainView, PluginPool, Point2dController, Point2dInputPlugin, Point3dInputPlugin, Point4dInputPlugin, PointNdConstraint, PointNdTextController, PointerHandler, PopupController, PopupView, Rack, RackApi, RackController, RangeConstraint, SVG_NS, Semver, SingleLogController, SliderController, SliderInputBindingApi, SliderTextController, SliderTextView, SliderView, StepConstraint, StringColorInputPlugin, StringInputPlugin, StringMonitorPlugin, TabApi, TabBladePlugin, TabController, TabPageApi, TabPageController, TextController, TextView, TpChangeEvent, TpError, TpEvent, TpFoldEvent, TpMouseEvent, TpTabSelectEvent, VERSION, ValueMap, ViewProps, addButtonAsBlade, addFolderAsBlade, addTabAsBlade, bindFoldable, bindValue, bindValueMap, bindValueToTextContent, boolFromUnknown, boolToString, colorFromRgbNumber, colorFromRgbaNumber, colorToFunctionalHslString, colorToFunctionalHslaString, colorToFunctionalRgbString, colorToFunctionalRgbaString, colorToHexRgbString, colorToHexRgbaString, colorToObjectRgbString, colorToObjectRgbaString, colorToRgbNumber, colorToRgbaNumber, composeParsers, connectValues, constrainRange, createBlade, createBladeController, createColorComponentsFromRgbObject, createColorStringParser, createDefaultPluginPool, createDimensionConstraint, createListConstraint, createNumberFormatter, createNumberTextInputParamsParser, createNumberTextPropsObject, createPlugin, createPointAxis, createPointDimensionParser, createPushedBuffer, createRangeConstraint, createReadonlyValue, createSliderTextProps, createStepConstraint, createSvgIconElement, createValue, deepEqualsArray, deepMerge, detectStringColorFormat, disableTransitionTemporarily, equalsColor, exportBladeState, findColorStringifier, findConstraint, findNextTarget, forceCast, forceReflow, formatPercentage, formatString, getAllBladePositions, getCanvasContext, getCssVar, getDecimalDigits, getHorizontalStepKeys, getStepForKey, getSuitableDecimalDigits, getSuitableKeyScale, getSuitableMax, getSuitablePointerScale, getVerticalStepKeys, getWindowDocument, importBladeState, indexOfChildElement, initializeBuffer, insertElementAt, isArrowKey, isBinding, isBindingValue, isColorObject, isCompatible, isContainerBladeApi, isContainerBladeController, isEmpty, isInputBindingController, isInputBindingValue, isMonitorBindingController, isMonitorBindingValue, isObject, isPropertyWritable, isRecord, isRgbColorObject, isRgbaColorObject, isValueBladeController, isVerticalArrowKey, loopRange, mapRange, normalizeListOptions, numberFromUnknown, numberToRgbColor, numberToRgbaColor, numberToString, parseListOptions, parseNumber, parsePickerLayout, parsePointDimensionParams, parseRecord, readIntColorString, removeChildElements, removeChildNodes, removeElement, stringFromUnknown, supportsTouch, valueToClassName, warnDeprecation, warnMissing, writePrimitive };
export type { ApiChangeEvents, ArrayStyleListOptions, BaseBladeParams, BaseInputParams, BaseMonitorParams, BaseParams, BasePlugin, Bindable, Binding, BindingApiEvents, BindingParams, BindingReader, BindingValue, BindingWriter, Blade, BladePlugin, BladePosition, BladeState, BooleanInputParams, BooleanMonitorParams, BufferedValue, BufferedValueController, BufferedValueEvents, ButtonApiEvents, ButtonBladeParams, ButtonEvents, ButtonParams, ButtonProps, ButtonPropsObject, Class, Color, ColorInputParams, Config$m as Config, Constraint, ContainerApi, Controller, EventListenable, FolderApiEvents, FolderBladeParams, FolderParams, FolderProps, FolderPropsObject, Formatter, InputBindingApi, InputBindingPlugin, InputView, LabelProps, LabelPropsObject, LabeledValueBladeConfig, ListItem, ListParamsOptions, ListProps, MicroParser, MonitorBindingApi, MonitorBindingPlugin, NumberInputParams, NumberMonitorParams, NumberTextInputParams, NumberTextProps, NumberTextPropsObject, ObjectStyleListOptions, Parser, PickerLayout, PluginType, Point2dInputParams, Point2dYParams, Point3dInputParams, Point4dInputParams, PointAxis, PointDimensionParams, PointNdAssembly, PointerData, PointerHandlerEvent, PointerHandlerEvents, Primitive, PropsPortable, RackEvents, ReadonlyValue, ReadonlyValueEvents, RgbColorObject, RgbaColorObject, SetRawValue, SliderProps, SliderPropsObject, StringColorFormat, StringInputParams, StringMonitorParams, TabBladeParams, TabPageParams, TabPageProps, TabPagePropsObject, TabParams, TextProps, Ticker, TickerEvents, TpBuffer, TpPlugin, TpPluginBundle, Tuple2, Tuple3, Tuple4, Value, ValueChangeOptions, ValueController, ValueEvents, ValueMapCore, ValueMapEvents, View, ViewPropsEvents, ViewPropsObject };

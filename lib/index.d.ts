import { ListenerDetail } from "./EventInfo";
export declare enum PluggableInnerEvent {
    PluggableReady = "PluggableReady",
    PluggableHookError = "PluggableHookError"
}
export default class Pluggable<Context> {
    static disableChunk: boolean;
    static defaultPlugins: Array<Function>;
    isNodeEnv: boolean;
    private events;
    /**
     * 插件间的事件通信， 用于不适合放在Host的中的事件
     */
    eventBus: Pluggable<any>;
    private eventEmitedMap;
    context: Context;
    /**
     * 注册默认的插件，在实例化前调用
     */
    static registerDefaultPlugin(plugins: any): void;
    /**
     *Creates an instance of Pluggable.
     * @param {boolean} [isPure=false] 纯净的实例不会生成eventBus, 不会注册默认插件，只提供基础的发布订阅能力
     * @memberof Pluggable
     */
    constructor(isPure?: boolean);
    /**
     *注册插件
     */
    registerPlugin(plugin: Function | {
        install: (...args: any[]) => any;
    }, context?: any): any;
    /**
     * alias of registerPlugin
     *
     * @memberof Pluggable
     */
    use(...args: any[]): void;
    /**
     * 注册事件
     * @param {string} events 支持多事件， 用逗号隔开， 比如on('eventA,eventB', f)
     * @param {Function} callback
     * @memberof Pluggable
     */
    on(events: string, callback: Function, detail?: ListenerDetail): void;
    onSync(events: string, callback: Function, detail?: ListenerDetail): void;
    private removeListener;
    off(events: string, callback: Function): void;
    onAllEvent(callbak: Function): void;
    private notifyEvent;
    private notifyDeferEvent;
    private _processError;
    emit(event: string, ...args: any[]): Array<any>;
    /**
     *异步并行执行事件, onSync生效
     *
     * @param {*} event
     * @returns
     * @memberof Pluggable
     */
    emitAsyncParalle(event: string, ...args: any[]): Promise<[{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]>;
    /**
     * 异步串行执行事件, , onSync生效
     *
     * @param {*} event
     * @memberof Pluggable
     */
    emitAsyncSeries(event: string, ...args: any[]): Promise<any>;
    once(event: string, callback: Function, detail?: ListenerDetail): void;
    onceSync(event: string, callback: Function, detail?: ListenerDetail): void;
    /**
     * 注册可能已触发的事件， 用于Ready, beforeReady等只触发一次的事件Hook
     *
     * @param {string} event
     * @param {*} callback
     * @memberof Pluggable
     */
    onAlready(event: string, callback: Function, detail?: ListenerDetail): void;
    onAlreadySync(event: string, callback: Function, detail?: ListenerDetail): void;
    destroy(): void;
}

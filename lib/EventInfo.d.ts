export declare class Event {
    __ALL_EVENTS__: Array<Listener>;
}
export declare class Listener {
    callback: Function;
    detail: ListenerDetail;
    constructor(callback: Function, detail?: ListenerDetail);
}
export declare class ListenerDetail {
    /**
     * 建议小于 10000, 大于10000内部使用
     *
     * @type {number}
     * @memberof ListenerDetail
     */
    priority?: number;
    constructor(priority?: number);
}
/**
 * 要支持有序广播可以通过 emitAsyncParalle, emitAsyncSeries 来实现
 * 内部实现有无必要?
 * 1. 有序广播是否增加了依赖
 * 2. 是否大大添加了复杂度
 * 3. 但事件的优先级不会
*/ 

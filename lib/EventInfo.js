"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Event = /** @class */ (function () {
    function Event() {
    }
    return Event;
}());
exports.Event = Event;
var Listener = /** @class */ (function () {
    function Listener(callback, detail) {
        this.callback = callback;
        this.detail = detail || new ListenerDetail();
    }
    return Listener;
}());
exports.Listener = Listener;
var ListenerDetail = /** @class */ (function () {
    function ListenerDetail(priority) {
        /**
         * 建议小于 10000, 大于10000内部使用
         *
         * @type {number}
         * @memberof ListenerDetail
         */
        this.priority = 1;
        this.priority = priority || 1;
    }
    return ListenerDetail;
}());
exports.ListenerDetail = ListenerDetail;
/**
 * 要支持有序广播可以通过 emitAsyncParalle, emitAsyncSeries 来实现
 * 内部实现有无必要?
 * 1. 有序广播是否增加了依赖
 * 2. 是否大大添加了复杂度
 * 3. 但事件的优先级不会
*/ 

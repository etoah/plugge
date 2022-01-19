"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluggableInnerEvent = void 0;
var chunkTask_1 = __importDefault(require("./chunkTask"));
var env_1 = require("./env");
var EventInfo_1 = require("./EventInfo");
var deferHookEventPrefix = '__defer__';
var PluggableInnerEvent;
(function (PluggableInnerEvent) {
    PluggableInnerEvent["PluggableReady"] = "PluggableReady";
    PluggableInnerEvent["PluggableHookError"] = "PluggableHookError";
})(PluggableInnerEvent = exports.PluggableInnerEvent || (exports.PluggableInnerEvent = {}));
var Pluggable = /** @class */ (function () {
    /**
     *Creates an instance of Pluggable.
     * @param {boolean} [isPure=false] 纯净的实例不会生成eventBus, 不会注册默认插件，只提供基础的发布订阅能力
     * @memberof Pluggable
     */
    function Pluggable(isPure) {
        var _this = this;
        if (isPure === void 0) { isPure = false; }
        this.isNodeEnv = env_1.isNodeEnv;
        this.eventEmitedMap = {};
        this.events = {
            __ALL_EVENTS__: []
        };
        !isPure && (this.eventBus = new Pluggable(true));
        this.onAllEvent(function (eventName, args) {
            if (!_this.eventEmitedMap[eventName]) {
                _this.eventEmitedMap[eventName] = args;
            }
        });
        !isPure && this.onSync(PluggableInnerEvent.PluggableReady, function () {
            Pluggable.defaultPlugins.forEach(function (plugin) { return _this.use(plugin); });
        });
        this.emit(PluggableInnerEvent.PluggableReady);
    }
    /**
     * 注册默认的插件，在实例化前调用
     */
    Pluggable.registerDefaultPlugin = function (plugins) {
        Pluggable.defaultPlugins = Pluggable.defaultPlugins.concat(plugins);
    };
    /**
     *注册插件
     */
    Pluggable.prototype.registerPlugin = function (plugin, context) {
        if (typeof plugin === 'function') {
            return plugin.call(this, this, context);
        }
        else if (plugin.install && typeof plugin.install === 'function') {
            return plugin.install.call(plugin, this, context);
        }
    };
    /**
     * alias of registerPlugin
     *
     * @memberof Pluggable
     */
    Pluggable.prototype.use = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.registerPlugin.apply(this, args);
    };
    /**
     * 注册事件
     * @param {string} events 支持多事件， 用逗号隔开， 比如on('eventA,eventB', f)
     * @param {Function} callback
     * @memberof Pluggable
     */
    Pluggable.prototype.on = function (events, callback, detail) {
        this.onSync(events.split(',').map(function (event) { return deferHookEventPrefix + event; }).join(','), callback, detail);
    };
    Pluggable.prototype.onSync = function (events, callback, detail) {
        var _this = this;
        var eventList = events.split(',');
        eventList.forEach(function (event) {
            if (typeof _this.events[event] !== 'object') {
                _this.events[event] = [];
            }
            _this.events[event].push(new EventInfo_1.Listener(callback, detail));
            _this.events[event] // 可能有性能损失, 但无影响 
                .sort(function (a, b) { return b.detail.priority - a.detail.priority; });
        });
    };
    Pluggable.prototype.removeListener = function (event, callback) {
        var idx;
        if (typeof this.events[event] === 'object') {
            idx = this.events[event].findIndex(function (l) { return l.callback == callback; });
            if (idx > -1) {
                this.events[event].splice(idx, 1);
            }
        }
    };
    Pluggable.prototype.off = function (events, callback) {
        var _this = this;
        events.split(',').forEach(function (event) {
            _this.removeListener(event, callback);
            _this.removeListener(deferHookEventPrefix + event, callback);
        });
    };
    Pluggable.prototype.onAllEvent = function (callbak) {
        this.events.__ALL_EVENTS__.push(new EventInfo_1.Listener(callbak));
    };
    Pluggable.prototype.notifyEvent = function (event, args) {
        var _this = this;
        this.notifyDeferEvent(event, args);
        if (this.events.__ALL_EVENTS__.length > 0) {
            this.events.__ALL_EVENTS__.forEach(function (listener) { return listener.callback.call(_this, event, args); });
        }
    };
    Pluggable.prototype.notifyDeferEvent = function (event, args) {
        var _this = this;
        setTimeout(function () {
            event = deferHookEventPrefix + event;
            var i, listeners, length;
            function execListener(listener) {
                try {
                    listener.callback.apply(this, args);
                }
                catch (error) {
                    this._processError(error, event.replace(deferHookEventPrefix, ''));
                }
            }
            if (typeof _this.events[event] === 'object') {
                listeners = _this.events[event].slice();
                if (_this.isNodeEnv || Pluggable.disableChunk) {
                    length = listeners.length;
                    for (i = 0; i < length; i++) {
                        execListener.call(_this, listeners[i]);
                    }
                }
                else {
                    chunkTask_1.default({
                        process: execListener,
                        context: _this,
                        taskParams: listeners
                    });
                }
            }
        }, 0);
    };
    Pluggable.prototype._processError = function (error, event) {
        console.error(event + " error", error);
        this.emitAsyncParalle(PluggableInnerEvent.PluggableHookError, { from: event, error: error });
    };
    Pluggable.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var i, listeners, length;
        this.notifyEvent(event, args);
        var results = [];
        if (typeof this.events[event] === 'object') {
            listeners = this.events[event].slice();
            length = listeners.length;
            for (i = 0; i < length; i++) {
                var result = void 0;
                try {
                    result = listeners[i].callback.apply(this, args);
                }
                catch (error) {
                    results.push(null);
                    this._processError(error, event);
                }
            }
        }
        return results;
    };
    /**
     *异步并行执行事件, onSync生效
     *
     * @param {*} event
     * @returns
     * @memberof Pluggable
     */
    Pluggable.prototype.emitAsyncParalle = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var i, listeners;
            var _this = this;
            return __generator(this, function (_a) {
                this.notifyEvent(event, args);
                if (typeof this.events[event] === 'object') {
                    listeners = this.events[event].slice();
                    return [2 /*return*/, Promise.all(listeners.map(function (listener) { return __awaiter(_this, void 0, void 0, function () {
                            var error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, listener.callback.apply(this, args)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                    case 2:
                                        error_1 = _a.sent();
                                        this._processError(error_1, event);
                                        return [2 /*return*/, null];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 异步串行执行事件, , onSync生效
     *
     * @param {*} event
     * @memberof Pluggable
     */
    Pluggable.prototype.emitAsyncSeries = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var i, listeners;
            var _this = this;
            return __generator(this, function (_a) {
                this.notifyEvent(event, args);
                if (typeof this.events[event] === 'object') {
                    listeners = this.events[event].slice();
                    return [2 /*return*/, listeners.reduce(function (chain, listener) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, chain.then(function () { return listener.callback.apply(_this, args); }, function (err) {
                                            _this._processError(err, event);
                                            return listener.callback.apply(_this, args);
                                        })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); }, Promise.resolve({}))];
                }
                return [2 /*return*/];
            });
        });
    };
    Pluggable.prototype.once = function (event, callback, detail) {
        this.on(event, function g() {
            this.off(event, g);
            callback.apply(this, arguments);
        }, detail);
    };
    Pluggable.prototype.onceSync = function (event, callback, detail) {
        this.onSync(event, function g() {
            this.off(event, g);
            callback.apply(this, arguments);
        }, detail);
    };
    /**
     * 当events列表中所有事件发生时触发回调， 只触发一次
     *
     * @param {string[]} events
     * @param {Function} callback
     * @param {ListenerDetail} [detail]
     * @memberof Pluggable
     */
    Pluggable.prototype.onEveryOnce = function (events, callback, detail) {
        var _this = this;
        Promise.all(events.map(function (event) { return new Promise(function (rs) { return _this.once(event, rs, detail); }); }))
            .then(function (datas) { return callback.call(_this, datas); });
    };
    /**
     * 当events列表中任意事件发生时触发回调, 只触发一次
     *
     * @param {string[]} events
     * @param {Function} callback
     * @param {ListenerDetail} [detail]
     * @memberof Pluggable
     */
    Pluggable.prototype.onAnyOnce = function (events, callback, detail) {
        var _this = this;
        Promise.race(events.map(function (event) { return new Promise(function (rs) { return _this.once(event, rs, detail); }); }))
            .then(function (datas) { return callback.call(_this, datas); });
    };
    /**
     * 注册可能已触发的事件， 用于Ready, beforeReady等只触发一次的事件Hook
     *
     * @param {string} event
     * @param {*} callback
     * @memberof Pluggable
     */
    Pluggable.prototype.onAlready = function (event, callback, detail) {
        var _this = this;
        if (this.eventEmitedMap[event]) {
            setTimeout(function () { callback.apply(_this, _this.eventEmitedMap[event]); }, 0);
        }
        else {
            this.once(event, callback, detail);
        }
    };
    Pluggable.prototype.onAlreadySync = function (event, callback, detail) {
        if (this.eventEmitedMap[event]) {
            callback.apply(this, this.eventEmitedMap[event]);
        }
        else {
            this.onceSync(event, callback, detail);
        }
    };
    Pluggable.prototype.destroy = function () {
        this.events = {
            __ALL_EVENTS__: []
        };
    };
    Pluggable.disableChunk = false;
    Pluggable.defaultPlugins = [];
    return Pluggable;
}());
exports.default = Pluggable;

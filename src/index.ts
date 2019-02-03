import chunkTask from "./chunkTask";
import {isNodeEnv} from "./env";
import {Event, Listener, ListenerDetail} from "./EventInfo";

const deferHookEventPrefix = '__defer__'
export enum  PluggableInnerEvent {
  PluggableReady = "PluggableReady",
  PluggableHookError = "PluggableHookError"
}

export default class Pluggable<Context> {
  static disableChunk: boolean = false;
  static defaultPlugins: Array<Function> = []
  isNodeEnv: boolean = isNodeEnv
  private events: Event 
  /**
   * 插件间的事件通信， 用于不适合放在Host的中的事件
   */
  eventBus: Pluggable<any>
  private eventEmitedMap: Object = {}
  context: Context

  /**
   * 注册默认的插件，在实例化前调用
   */
  static registerDefaultPlugin(plugins){
    Pluggable.defaultPlugins = Pluggable.defaultPlugins.concat(plugins)
  }  

  /**
   *Creates an instance of Pluggable.
   * @param {boolean} [isPure=false] 纯净的实例不会生成eventBus, 不会注册默认插件，只提供基础的发布订阅能力
   * @memberof Pluggable
   */
  constructor(isPure:boolean = false){
    this.events = {
      __ALL_EVENTS__: []
    }
    
    !isPure && (this.eventBus = new Pluggable(true))
    this.onAllEvent((eventName, args) =>{
      if(!this.eventEmitedMap[eventName]){
        this.eventEmitedMap[eventName] = args
      }
    })

    !isPure && this.onSync(PluggableInnerEvent.PluggableReady, ()=>{
      Pluggable.defaultPlugins.forEach(plugin => this.use(plugin))
    })

    this.emit(PluggableInnerEvent.PluggableReady)
  }

  /**
   *注册插件
   */
  registerPlugin(plugin : Function | {install: (...args) => any}, context?: any){
    if(typeof plugin === 'function'){
      return plugin.call(this, this, context);
    } else if(plugin.install && typeof plugin.install === 'function'){
      return plugin.install.call(plugin, this, context);
    }
  }

  /**
   * alias of registerPlugin
   *
   * @memberof Pluggable
   */
  use(...args){
    this.registerPlugin.apply(this, args);
  }

  /**
   * 注册事件
   * @param {string} events 支持多事件， 用逗号隔开， 比如on('eventA,eventB', f)
   * @param {Function} callback
   * @memberof Pluggable
   */
  on(events: string, callback: Function, detail?: ListenerDetail) {
    this.onSync(events.split(',').map(event=>deferHookEventPrefix + event).join(','), callback, detail)
  }
  onSync(events: string, callback: Function, detail?: ListenerDetail) {
    var eventList = events.split(',')
    eventList.forEach(event =>{
      if (typeof this.events[event] !== 'object') {
        this.events[event] = [];
      }
  
      this.events[event].push(new Listener(callback, detail));
      this.events[event] // 可能有性能损失, 但无影响 
        .sort((a:Listener, b:Listener) => b.detail.priority - a.detail.priority)
    })
  }

  private removeListener(event: string, callback: Function) {
    var idx;
    if (typeof this.events[event] === 'object') {
        idx = this.events[event].findIndex(l => l.callback == callback);
        if (idx > -1) {
            this.events[event].splice(idx, 1);
        }
    }
  }

  off(events: string, callback: Function){
    events.split(',').forEach(event=>{
      this.removeListener(event, callback)
      this.removeListener(deferHookEventPrefix + event, callback)
    })
  }

  onAllEvent(callbak: Function){
    this.events.__ALL_EVENTS__.push(new Listener(callbak))
  }

  private notifyEvent(event: string, args){
    this.notifyDeferEvent(event, args)
    if(this.events.__ALL_EVENTS__.length > 0){
      this.events.__ALL_EVENTS__.forEach(listener => listener.callback.call(this, event ,args))
    }
  }

  private notifyDeferEvent(event: string, args){
    setTimeout(() => {
      event = deferHookEventPrefix + event
      var i, listeners, length;
      function execListener(listener){
        try {
          listener.callback.apply(this, args)
        } catch (error) {
          this._processError(error, event.replace(deferHookEventPrefix, ''))
        }
      }

      if (typeof this.events[event] === 'object') {
          listeners = this.events[event].slice();
          if(this.isNodeEnv || Pluggable.disableChunk){
            length = listeners.length;
            for (i = 0; i < length; i++) {
              execListener.call(this, listeners[i])
            }
          } else {
            chunkTask({
              process: execListener,
              context: this,
              taskParams: listeners
            });
          }
      }
    }, 0);
  }

  private _processError(error: Error, event: string){
    console.error(`${event} error`, error)
    this.emitAsyncParalle(PluggableInnerEvent.PluggableHookError, {from: event, error})
  }

  emit(event: string, ...args): Array<any> {
    var i, listeners, length;
    this.notifyEvent(event, args)
    var results = [] 

    if (typeof this.events[event] === 'object') {
        listeners = this.events[event].slice();
        length = listeners.length;
  
        for (i = 0; i < length; i++) {
          let result
          try{
            result = listeners[i].callback.apply(this, args)
          }catch(error){
            results.push(null)
            this._processError(error, event)
          }
        }
    }

    return results
  }

  /**
   *异步并行执行事件, onSync生效
   *
   * @param {*} event
   * @returns
   * @memberof Pluggable
   */
  async emitAsyncParalle(event: string, ...args){
    var i, listeners;
    this.notifyEvent(event, args)

    if (typeof this.events[event] === 'object') {
      listeners = this.events[event].slice();

      return Promise.all(listeners.map(async listener=>{
        try {
          return await listener.callback.apply(this, args);
        } catch (error) {
          this._processError(error, event)
          return null
        }
      }))
    }
  }

  /**
   * 异步串行执行事件, , onSync生效
   *
   * @param {*} event
   * @memberof Pluggable
   */
  async emitAsyncSeries(event: string, ...args){
    var i, listeners;
    this.notifyEvent(event, args)

    if (typeof this.events[event] === 'object') {
      listeners = this.events[event].slice()

      return listeners.reduce(async (chain, listener) => {
        return await chain.then(()=>listener.callback.apply(this, args), (err)=>{
          this._processError(err, event)
          return listener.callback.apply(this, args)
        })
      }, Promise.resolve({}))
    }
  }

  once(event: string, callback: Function, detail?: ListenerDetail) {
    this.on(event, function g () {
        this.off(event, g);
        callback.apply(this, arguments);
    }, detail);
  }

  onceSync(event: string, callback: Function, detail?: ListenerDetail) {
    this.onSync(event, function g () {
        this.off(event, g);
        callback.apply(this, arguments);
    }, detail);
  }


  /**
   * 注册可能已触发的事件， 用于Ready, beforeReady等只触发一次的事件Hook
   *
   * @param {string} event
   * @param {*} callback
   * @memberof Pluggable
   */
  onAlready(event: string, callback: Function, detail?: ListenerDetail){
    if(this.eventEmitedMap[event]){
      setTimeout(() => {callback.apply(this, this.eventEmitedMap[event])}, 0)
    } else {
      this.once(event, callback, detail)
    }
  }
  onAlreadySync(event: string, callback: Function, detail?: ListenerDetail){
    if(this.eventEmitedMap[event]){
      callback.apply(this, this.eventEmitedMap[event]);
    } else {
      this.onceSync(event, callback, detail)
    }
  }

  destroy() {
    this.events = {
      __ALL_EVENTS__: []
    }
  }
}
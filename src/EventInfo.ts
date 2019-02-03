export class Event {
  __ALL_EVENTS__: Array<Listener>
}

export class Listener{
  detail:ListenerDetail
  constructor(public callback: Function, detail?: ListenerDetail){
    this.detail = detail || new ListenerDetail();
  }
}

export class ListenerDetail{
  /**
   * 建议小于 10000, 大于10000内部使用
   *
   * @type {number}
   * @memberof ListenerDetail
   */
  priority?: number = 1
  constructor(priority?: number){
    this.priority = priority || 1
  }
}

/** 
 * 要支持有序广播可以通过 emitAsyncParalle, emitAsyncSeries 来实现
 * 内部实现有无必要?
 * 1. 有序广播是否增加了依赖
 * 2. 是否大大添加了复杂度
 * 3. 但事件的优先级不会
*/

// 防止改名
var chunk = chunkTask;

/**
 * 任务分片执行
 *
 * @export
 * @param {Options} options
 */
export default function chunkTask(options: Options) {
  let {process, taskParams, context, interval, onTick } = options;
  if(taskParams.length === 0)return
  // console.log('-------chunkTask--------')
  interval = interval || 12 // 16ms 是fps为60fps, 预留4ms render
  onTick = onTick || (function () { })

  let startTime = Date.now()
  var tickFunction = setTimeout;

  do {
    let item = taskParams.shift()
    process.call(context, item)
  }
  while (taskParams.length > 0 && Date.now() - startTime < interval)

  if (taskParams.length > 0) {
    tickFunction(() => {
      chunk.call(this, options)
      onTick.call(this, options)
    }, 0)
  }
}

class Options {
  /**
   * 处理函数
   *
   * @memberof Options
   */
  process: (...args: any[]) => any;
  /**
   *参数列表
   *
   * @type {*}
   * @memberof Options
   */
  taskParams: any[];
  /**
   *每个任务的上下文
   *
   * @type {*}
   * @memberof Options
   */
  context?: any;
  /**
   *间隔
   *
   * @type {number}
   * @memberof Options
   */
  interval?: number;
  /**
   *每次执行的间隔
   *
   * @memberof Options
   */
  onTick?: (...args: any[]) => any;
}
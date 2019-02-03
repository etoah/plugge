/**
 * 任务分片执行
 *
 * @export
 * @param {Options} options
 */
export default function chunkTask(options: Options): void;
declare class Options {
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
export {};

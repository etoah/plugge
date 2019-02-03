"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 防止改名
var chunk = chunkTask;
/**
 * 任务分片执行
 *
 * @export
 * @param {Options} options
 */
function chunkTask(options) {
    var _this = this;
    var process = options.process, taskParams = options.taskParams, context = options.context, interval = options.interval, onTick = options.onTick;
    if (taskParams.length === 0)
        return;
    // console.log('-------chunkTask--------')
    interval = interval || 12; // 16ms 是fps为60fps, 预留4ms render
    onTick = onTick || (function () { });
    var startTime = Date.now();
    var tickFunction = setTimeout;
    do {
        var item = taskParams.shift();
        process.call(context, item);
    } while (taskParams.length > 0 && Date.now() - startTime < interval);
    if (taskParams.length > 0) {
        tickFunction(function () {
            chunk.call(_this, options);
            onTick.call(_this, options);
        }, 0);
    }
}
exports.default = chunkTask;
var Options = /** @class */ (function () {
    function Options() {
    }
    return Options;
}());

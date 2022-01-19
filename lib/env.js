"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNodeEnv = void 0;
var isNode = false;
if (typeof process === 'object') {
    if (typeof process.versions === 'object') {
        if (typeof process.versions.node !== 'undefined') {
            isNode = true;
        }
    }
}
exports.isNodeEnv = isNode;

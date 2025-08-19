"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.PRIORITY = void 0;
/**
 * logger-hard-point
 * JSON 構造ログ出力（1 行 1 JSON）。
 * 既存利用箇所との後方互換 (logger.error(...)) を維持。
 */
var node_util_1 = require("node:util");
exports.PRIORITY = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};
var currentLevel = exports.PRIORITY.info; // 型を PriorityValue に明示
function write(rec) {
    try {
        process.stdout.write(JSON.stringify(rec) + '\n');
    }
    catch (_a) {
        process.stdout.write(JSON.stringify({
            ts: new Date().toISOString(),
            level: 'error',
            levelNo: exports.PRIORITY.error,
            msg: 'Failed to serialize log record',
        }) + '\n');
    }
}
function normalize(value) {
    if (value instanceof Error) {
        return { msg: value.message, stack: value.stack };
    }
    if (typeof value === 'string') {
        return { msg: value };
    }
    return { msg: node_util_1.default.inspect(value, { depth: 5 }) };
}
function isPriority(v) {
    return v === 0 || v === 1 || v === 2 || v === 3;
}
function log(level, value, meta) {
    if (exports.PRIORITY[level] > currentLevel)
        return;
    var _a = normalize(value), msg = _a.msg, stack = _a.stack;
    write(__assign(__assign({ ts: new Date().toISOString(), level: level, levelNo: exports.PRIORITY[level], msg: msg }, (stack ? { stack: stack } : {})), (meta || {})));
}
exports.logger = {
    /**
     * ログレベル設定。
     * number を受けた場合は 0|1|2|3 か判定してから反映。
     */
    setLogLevel: function (p) {
        if (isPriority(p)) {
            currentLevel = p;
        }
    },
    /**
     * 旧実装互換：冗長ログ許可的メソッド。現状は空。
     */
    noizy: function () {
        return;
    },
    error: function (value, meta) {
        log('error', value, meta);
    },
    warn: function (value, meta) {
        log('warn', value, meta);
    },
    info: function (value, meta) {
        log('info', value, meta);
    },
    debug: function (value, meta) {
        log('debug', value, meta);
    },
};
exports.default = exports.logger;

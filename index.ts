/**
 * logger-hard-point
 * JSON 構造ログ出力（1 行 1 JSON）。
 * 既存利用箇所との後方互換 (logger.error(...)) を維持。
 */
import util from 'node:util';

export const PRIORITY = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
} as const;

export type PriorityKey = keyof typeof PRIORITY;
export type PriorityValue = (typeof PRIORITY)[PriorityKey];

interface BaseMeta {
  requestId?: string;
  method?: string;
  path?: string;
  status?: number;
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string | number;
  from?: number;
  count?: number;
  total?: number;
  elapsedMs?: number;
  [k: string]: unknown;
}

interface LogRecord extends BaseMeta {
  ts: string;
  level: PriorityKey;
  levelNo: PriorityValue;
  msg: string;
  stack?: string;
}

let currentLevel: PriorityValue = PRIORITY.info; // 型を PriorityValue に明示

function write(rec: LogRecord) {
  try {
    process.stdout.write(JSON.stringify(rec) + '\n');
  } catch {
    process.stdout.write(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      levelNo: PRIORITY.error,
      msg: 'Failed to serialize log record',
    }) + '\n');
  }
}

function normalize(value: unknown): { msg: string; stack?: string } {
  if (value instanceof Error) {
    return { msg: value.message, stack: value.stack };
  }
  if (typeof value === 'string') {
    return { msg: value };
  }
  return { msg: util.inspect(value, { depth: 5 }) };
}

function isPriority(v: number): v is PriorityValue {
  return v === 0 || v === 1 || v === 2 || v === 3 || v === 4;
}

function log(level: PriorityKey, value: unknown, meta?: BaseMeta) {
  if (PRIORITY[level] > currentLevel) return;
  const { msg, stack } = normalize(value);
  write({
    ts: new Date().toISOString(),
    level,
    levelNo: PRIORITY[level],
    msg,
    ...(stack ? { stack } : {}),
    ...(meta || {}),
  });
}

export const logger = {
  /**
   * ログレベル設定。
   * number を受けた場合は 0|1|2|3|4 か判定してから反映。
   */
  setLogLevel(p: number | PriorityValue) {
    if (isPriority(p)) {
      currentLevel = p;
    }
  },
  /**
   * 旧実装互換：冗長ログ許可的メソッド。現状は空。
   */
  noizy() {
    return;
  },
  error(value: unknown, meta?: BaseMeta) {
    log('error', value, meta);
  },
  warn(value: unknown, meta?: BaseMeta) {
    log('warn', value, meta);
  },
  info(value: unknown, meta?: BaseMeta) {
    log('info', value, meta);
  },
  debug(value: unknown, meta?: BaseMeta) {
    log('debug', value, meta);
  },
  trace(value: unknown, meta?: BaseMeta) {
    log('trace', value, meta);
  },
};

export default logger;

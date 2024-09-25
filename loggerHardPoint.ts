#!/usr/bin/env node

import * as path from 'path';

export type LogLevelType = {
  priority: number,
};

export type PriorityKindsType = {
  crit: LogLevelType,
  err: LogLevelType,
  warn: LogLevelType,
  info: LogLevelType,
  debug: LogLevelType,
};

export type LogSettingType = {
  log_level: string,
  noizy_mode: boolean,
};

type SyslogSettingType = {
  host: string,
  port: number,
  log_level: LogLevelType,
  facility: string,
  type: string,
};

// 番号はSyslogのログレベルの数値に合わせる
export const PRIORITY: PriorityKindsType = {
  crit: { priority: 2 },
  err: { priority: 3 },
  warn: { priority: 4 },
  info: { priority: 6 },
  debug: { priority: 7 },
};

function isGoodMessage(messageArray: any[]) {
  return !messageArray.some((message) => message === undefined);
}

class LoggerHardPoint {
  logLevel: LogLevelType;
  isNoizyMode: boolean;

  constructor(logLevel: LogLevelType) {
    const functionName = 'LoggerHardPoint.constructor';
    if (Object.values(PRIORITY).indexOf(logLevel) === -1) {
      // eslint-disable-next-line no-console
      console.error(functionName, ': logLevel is not known PRIORITY.');
      this.logLevel = PRIORITY.debug;
    } else {
      this.logLevel = logLevel;
    }
    this.isNoizyMode = true;
  }

  setLogLevel(logLevel: LogLevelType) {
    const functionName = 'LoggerHardPoint.setLogLevel';
    if (Object.values(PRIORITY).indexOf(logLevel) === -1) {
      // eslint-disable-next-line no-console
      console.error(functionName, ': logLevel is not known PRIORITY.');
      this.logLevel = PRIORITY.debug;
    } else {
      this.logLevel = logLevel;
    }
  }

  debug(...message: any[]) {
    if (this.logLevel.priority < PRIORITY.debug.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('LoggerHardPoint.debug:', 'Bad message.');
      return;
    }
    if (this.isNoizyMode) {
      console.log(this.format(...message));
    }
  }

  info(...message: any[]) {
    if (this.logLevel.priority < PRIORITY.info.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('LoggerHardPoint.info:', 'Bad message.');
      return;
    }
    if (this.isNoizyMode) {
      console.log(this.format(...message));
    }
  }

  warn(...message: any[]) {
    if (this.logLevel.priority < PRIORITY.warn.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('LoggerHardPoint.warn:', 'Bad message.');
      return;
    }
    if (this.isNoizyMode) {
      console.log(this.format(...message));
    }
  }

  error(...message: any[]) {
    if (this.logLevel.priority < PRIORITY.err.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('LoggerHardPoint.err:', 'Bad message.');
      return;
    }
    if (this.isNoizyMode) {
      console.log(this.format(...message));
    }
  }

  err(...message: any[]) {
    this.error(...message);
  }

  critical(...message: any[]) {
    if (this.logLevel.priority < PRIORITY.crit.priority) return;
    if (!isGoodMessage(message)) {
      this.warn('LoggerHardPoint.crit:', 'Bad message.');
      return;
    }
    if (this.isNoizyMode) {
      console.log(this.format(...message));
    }
  }

  crit(...message: any[]) {
    this.critical(...message);
  }

  format(...message: any[]) {
    let logString = '';
    const formatArray = (messageList: any[]) => {
      let logString = '';
      for (const m of messageList) {
        switch (typeof m) {
          case 'object':
            if (Array.isArray(m)) {
              logString = `${logString},[${formatArray(m)}]`;
            } else {
              try {
                logString = `${logString},${JSON.stringify(m)}`;
              } catch (err: unknown) {
                if (err instanceof Error) {
                  console.error(err.message);
                  logString = `${logString},${m}`;
                }
              }
            }
            break;
          case 'string':
          case 'number':
          case 'boolean':
            logString = `${logString},${m}`
            break;
          default:
            break;
        }
      }
      return logString.substr(1);
    }
    for (const m of message) {
      switch (typeof m) {
        case 'object':
          try {
            if (Array.isArray(m)) {
              logString = `${logString} [${formatArray(m)}]`;
            } else {
              logString = `${logString} ${JSON.stringify(m)}`;
            }
          } catch (err: unknown) {
            if (err instanceof Error) {
              console.error(err.message);
              logString = `${logString} ${m}`;
            }
          }
          break;
        case 'string':
        case 'number':
        case 'boolean':
          logString = `${logString} ${m}`
          break;
        default:
          break;
      }
    }
    return logString;
  }

  // コンソール出力に関する設定を調整する
  quiet() {
    this.isNoizyMode = false;
  }

  // コンソール出力に関する設定を調整する
  noizy() {
    this.isNoizyMode = true;
  }
}

export const logger = new LoggerHardPoint(PRIORITY.debug);

export const updateLogSetting = (loggerInstance: LoggerHardPoint, logSetting: LogSettingType) => {
  // loggerHardPoint関係の設定
  if (logSetting !== undefined) {
    if (Object.keys(PRIORITY).indexOf(logSetting.log_level) !== -1) {
      loggerInstance.setLogLevel(PRIORITY[logSetting.log_level as keyof PriorityKindsType]);
    } else {
      // eslint-disable-next-line no-console
      console.log('log_level is unknown. Work on debug level.');
      loggerInstance.setLogLevel(PRIORITY.debug);
    }
    if (logSetting.noizy_mode === true) {
      loggerInstance.noizy();
    } else {
      loggerInstance.quiet();
    }
  }
};

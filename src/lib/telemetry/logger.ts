import { captureError, addBreadcrumb } from './monitoring';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogData = string | Record<string, unknown>;

function log(level: LogLevel, message: string, data?: LogData) {
  if (__DEV__) {
    const prefix = `[${level.toUpperCase()}]`;
    const args = data ? [prefix, message, data] : [prefix, message];
    switch (level) {
      case 'error':
        console.error(...args);
        break;
      case 'warn':
        console.warn(...args);
        break;
      default:
        console.log(...args);
    }
  }

  const context = typeof data === 'string' ? { detail: data } : data;

  if (level === 'error') {
    const err =
      context?.error instanceof Error ? context.error : new Error(message);
    captureError(err, { message, ...context });
  } else if (level !== 'debug') {
    addBreadcrumb(message, context);
  }
}

export const logger = {
  debug: (msg: string, data?: LogData) => log('debug', msg, data),
  info: (msg: string, data?: LogData) => log('info', msg, data),
  warn: (msg: string, data?: LogData) => log('warn', msg, data),
  error: (msg: string, data?: LogData) => log('error', msg, data),
};

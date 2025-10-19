const DEV = __DEV__;

export const logger = {
  debug: (...args: unknown[]) => {
    if (DEV) console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (DEV) console.info('[INFO],', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};

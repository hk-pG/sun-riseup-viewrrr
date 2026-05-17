import type { LogOptions } from '@tauri-apps/plugin-log';
import { debug, error, info, trace, warn } from '@tauri-apps/plugin-log';

const isTauri =
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const logger = {
  info: (msg: string, options?: LogOptions) =>
    isTauri ? info(msg, options).catch(console.info) : console.info(msg),
  warn: (msg: string, options?: LogOptions) =>
    isTauri ? warn(msg, options).catch(console.warn) : console.warn(msg),
  error: (msg: string, options?: LogOptions) =>
    isTauri ? error(msg, options).catch(console.error) : console.error(msg),
  debug: (msg: string, options?: LogOptions) =>
    isTauri ? debug(msg, options).catch(console.debug) : console.debug(msg),
  trace: (msg: string, options?: LogOptions) =>
    isTauri ? trace(msg, options).catch(console.debug) : console.trace(msg),
};

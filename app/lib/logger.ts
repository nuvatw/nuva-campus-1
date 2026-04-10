/**
 * 結構化日誌工具
 *
 * 統一全站 console.error/warn/log，提供：
 * - 開發環境：帶分類標籤的彩色輸出
 * - 生產環境：僅輸出 error 層級（可接入外部服務）
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
  timestamp: string;
}

const isDev = process.env.NODE_ENV === 'development';

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[90m',  // gray
  info: '\x1b[36m',   // cyan
  warn: '\x1b[33m',   // yellow
  error: '\x1b[31m',  // red
};

const RESET = '\x1b[0m';

function formatEntry(entry: LogEntry): string {
  return `${LEVEL_COLORS[entry.level]}[${entry.level.toUpperCase()}]${RESET} [${entry.category}] ${entry.message}`;
}

function emit(entry: LogEntry) {
  if (entry.level === 'debug' && !isDev) return;
  if (entry.level === 'info' && !isDev) return;
  if (entry.level === 'warn' && !isDev) return;

  const formatted = formatEntry(entry);

  switch (entry.level) {
    case 'error':
      if (entry.data !== undefined) {
        console.error(formatted, entry.data);
      } else {
        console.error(formatted);
      }
      break;
    case 'warn':
      if (entry.data !== undefined) {
        console.warn(formatted, entry.data);
      } else {
        console.warn(formatted);
      }
      break;
    default:
      if (entry.data !== undefined) {
        console.log(formatted, entry.data);
      } else {
        console.log(formatted);
      }
  }
}

function createEntry(level: LogLevel, category: string, message: string, data?: unknown): LogEntry {
  return {
    level,
    category,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 建立分類 logger
 *
 * @example
 * ```ts
 * const log = createLogger('checkin');
 * log.error('Update failed', error);
 * log.info('Participant checked in', { name });
 * ```
 */
export function createLogger(category: string) {
  return {
    debug: (message: string, data?: unknown) =>
      emit(createEntry('debug', category, message, data)),
    info: (message: string, data?: unknown) =>
      emit(createEntry('info', category, message, data)),
    warn: (message: string, data?: unknown) =>
      emit(createEntry('warn', category, message, data)),
    error: (message: string, data?: unknown) =>
      emit(createEntry('error', category, message, data)),
  };
}

/** 全域 logger（不帶分類） */
export const logger = createLogger('app');

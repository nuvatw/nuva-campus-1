/**
 * 認證相關常數配置
 * 集中管理所有認證相關的魔術值
 */

/** PIN 碼長度 */
export const PIN_LENGTH = 4;

/** 認證過期時間（小時） */
export const EXPIRY_HOURS = 24;

/** localStorage 存儲鍵名 */
export const AUTH_STORAGE_KEY = 'nuva_campus_auth';

/** 活動 key 前綴 */
export const EVENT_KEY_PREFIX = 'event_';

/** 認證配置 */
export const AUTH_CONFIG = {
  PIN_LENGTH,
  EXPIRY_HOURS,
  STORAGE_KEY: AUTH_STORAGE_KEY,
  EVENT_PREFIX: EVENT_KEY_PREFIX,
  /** 過期時間（毫秒） */
  get EXPIRY_MS() {
    return EXPIRY_HOURS * 60 * 60 * 1000;
  },
} as const;

/**
 * 認證狀態存儲工具
 * 統一管理 localStorage 中的認證狀態存取
 */

import { AUTH_CONFIG } from '@/app/constants/auth';
import { isBaseRole, isEventRole, extractEventId, type Role } from '@/app/constants/roles';
import type { AuthState, PasswordKey } from '@/app/types/password';

/** 認證項目狀態 */
interface AuthItem {
  verified: boolean;
  expiry: number;
}

/**
 * 取得初始認證狀態
 */
function getInitialState(): AuthState {
  return {
    nunu: { verified: false, expiry: 0 },
    ambassador: { verified: false, expiry: 0 },
    guardian: { verified: false, expiry: 0 },
    guardian_admin: { verified: false, expiry: 0 },
    events: {},
  };
}

/**
 * AuthStorage - 統一的認證狀態存儲管理
 *
 * 取代原本散落在多個檔案的 getAuthState() 函數
 */
export const AuthStorage = {
  /**
   * 讀取認證狀態
   */
  get(): AuthState {
    if (typeof window === 'undefined') {
      return getInitialState();
    }

    try {
      const stored = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
      if (!stored) return getInitialState();
      return JSON.parse(stored);
    } catch {
      return getInitialState();
    }
  },

  /**
   * 讀取並清理過期狀態
   */
  getClean(): AuthState {
    if (typeof window === 'undefined') {
      return getInitialState();
    }

    try {
      const stored = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY);
      if (!stored) return getInitialState();

      const parsed = JSON.parse(stored) as AuthState;
      const now = Date.now();

      // 清理過期的驗證狀態
      const cleaned: AuthState = {
        nunu: parsed.nunu?.expiry > now ? parsed.nunu : { verified: false, expiry: 0 },
        ambassador: parsed.ambassador?.expiry > now ? parsed.ambassador : { verified: false, expiry: 0 },
        guardian: parsed.guardian?.expiry > now ? parsed.guardian : { verified: false, expiry: 0 },
        guardian_admin: parsed.guardian_admin?.expiry > now ? parsed.guardian_admin : { verified: false, expiry: 0 },
        events: {},
      };

      // 清理過期的活動驗證
      if (parsed.events) {
        for (const [eventId, state] of Object.entries(parsed.events)) {
          if (state.expiry > now) {
            cleaned.events[eventId] = state;
          }
        }
      }

      return cleaned;
    } catch {
      return getInitialState();
    }
  },

  /**
   * 儲存認證狀態
   */
  set(state: AuthState): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEY, JSON.stringify(state));
  },

  /**
   * 清除所有認證狀態
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
  },

  /**
   * 檢查特定 key 是否已驗證且未過期
   */
  isVerified(key: PasswordKey): boolean {
    const authState = this.get();
    const now = Date.now();

    if (isEventRole(key)) {
      const eventId = extractEventId(key);
      if (!eventId) return false;
      const eventState = authState.events?.[eventId];
      return eventState?.verified === true && eventState.expiry > now;
    }

    if (isBaseRole(key)) {
      const state = authState[key];
      return state?.verified === true && state.expiry > now;
    }

    return false;
  },

  /**
   * 設置特定 key 為已驗證
   */
  setVerified(key: PasswordKey): void {
    const authState = this.get();
    const expiry = Date.now() + AUTH_CONFIG.EXPIRY_MS;

    if (isEventRole(key)) {
      const eventId = extractEventId(key);
      if (eventId) {
        authState.events = {
          ...authState.events,
          [eventId]: { verified: true, expiry },
        };
      }
    } else if (isBaseRole(key)) {
      authState[key] = { verified: true, expiry };
    }

    this.set(authState);
  },

  /**
   * 清除特定 key 的驗證狀態
   */
  clearKey(key: PasswordKey): void {
    const authState = this.get();

    if (isEventRole(key)) {
      const eventId = extractEventId(key);
      if (eventId && authState.events[eventId]) {
        delete authState.events[eventId];
      }
    } else if (isBaseRole(key)) {
      authState[key] = { verified: false, expiry: 0 };
    }

    this.set(authState);
  },

  /**
   * 取得初始狀態（用於 React state 初始化）
   */
  getInitialState,
};

export type { AuthItem };

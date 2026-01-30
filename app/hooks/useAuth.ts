'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthStorage } from '@/app/utils/authStorage';
import { isBaseRole, isEventRole, extractEventId } from '@/app/constants/roles';
import { AUTH_CONFIG } from '@/app/constants/auth';
import type { AuthState, PasswordKey } from '@/app/types/password';

interface VerifyResponse {
  success: boolean;
  error?: string;
  message?: string;
  retryAfter?: number;
}

/**
 * useAuth - 認證狀態管理 Hook
 *
 * 使用 AuthStorage 統一管理認證狀態
 * 所有密碼驗證透過 API 進行，不直接查詢資料庫
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(AuthStorage.getInitialState);
  const [isLoading, setIsLoading] = useState(true);

  // 載入時讀取 localStorage（帶清理過期狀態）
  useEffect(() => {
    const state = AuthStorage.getClean();
    setAuthState(state);
    // 同步清理後的狀態到 localStorage
    AuthStorage.set(state);
    setIsLoading(false);
  }, []);

  /**
   * 驗證密碼
   * 透過 API 進行驗證，不直接查詢 Supabase
   */
  const verifyPassword = useCallback(async (key: PasswordKey, inputPassword: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, password: inputPassword }),
      });

      const data: VerifyResponse = await response.json();

      // 處理 Rate Limiting
      if (response.status === 429) {
        console.warn(`[useAuth] Rate limited. Retry after ${data.retryAfter} seconds`);
        return false;
      }

      if (!data.success) {
        return false;
      }

      // 驗證成功，更新狀態
      const expiry = Date.now() + AUTH_CONFIG.EXPIRY_MS;

      setAuthState((prev) => {
        let newState: AuthState;

        if (isEventRole(key)) {
          const eventId = extractEventId(key);
          if (!eventId) return prev;
          newState = {
            ...prev,
            events: {
              ...prev.events,
              [eventId]: { verified: true, expiry },
            },
          };
        } else if (isBaseRole(key)) {
          newState = {
            ...prev,
            [key]: { verified: true, expiry },
          };
        } else {
          return prev;
        }

        AuthStorage.set(newState);
        return newState;
      });

      return true;
    } catch (err) {
      console.error('[useAuth] 驗證密碼時發生錯誤:', err);
      return false;
    }
  }, []);

  /**
   * 檢查是否已驗證
   */
  const isVerified = useCallback((key: PasswordKey): boolean => {
    const now = Date.now();

    if (isEventRole(key)) {
      const eventId = extractEventId(key);
      if (!eventId) return false;
      const eventState = authState.events[eventId];
      return eventState?.verified === true && eventState.expiry > now;
    }

    if (isBaseRole(key)) {
      const state = authState[key];
      return state?.verified === true && state.expiry > now;
    }

    return false;
  }, [authState]);

  /**
   * 登出（清除驗證狀態）
   */
  const logout = useCallback((key?: PasswordKey) => {
    setAuthState((prev) => {
      let newState: AuthState;

      if (!key) {
        // 清除所有
        newState = AuthStorage.getInitialState();
      } else if (isEventRole(key)) {
        const eventId = extractEventId(key);
        if (!eventId) return prev;
        const { [eventId]: _, ...restEvents } = prev.events;
        newState = { ...prev, events: restEvents };
      } else if (isBaseRole(key)) {
        newState = {
          ...prev,
          [key]: { verified: false, expiry: 0 },
        };
      } else {
        return prev;
      }

      AuthStorage.set(newState);
      return newState;
    });
  }, []);

  return {
    authState,
    isLoading,
    verifyPassword,
    isVerified,
    logout,
  };
}

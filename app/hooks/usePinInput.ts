'use client';

import { useState, useCallback, useEffect } from 'react';
import { PIN_LENGTH } from '@/app/constants/auth';

interface UsePinInputOptions {
  /** PIN 碼長度，預設為 4 */
  length?: number;
  /** 輸入完成時的回調 */
  onComplete?: (pin: string) => void;
  /** 是否自動監聽鍵盤事件 */
  enableKeyboard?: boolean;
  /** ESC 鍵回調 */
  onEscape?: () => void;
}

interface UsePinInputReturn {
  /** 當前輸入的 PIN 碼陣列 */
  code: string[];
  /** PIN 碼字串 */
  pin: string;
  /** 是否已填滿 */
  isFull: boolean;
  /** 是否為空 */
  isEmpty: boolean;
  /** 處理數字輸入 */
  handleDigit: (digit: string) => void;
  /** 處理退格 */
  handleBackspace: () => void;
  /** 清除所有輸入 */
  clear: () => void;
  /** 重置（清除並可選延遲） */
  reset: (delay?: number) => void;
}

/**
 * usePinInput - 統一的 PIN 碼輸入邏輯
 *
 * 取代原本在 AuthGuard 和 PasswordModal 中重複的輸入處理邏輯
 *
 * @example
 * ```tsx
 * const { code, handleDigit, handleBackspace, clear } = usePinInput({
 *   onComplete: (pin) => verifyPassword(pin),
 * });
 * ```
 */
export function usePinInput(options: UsePinInputOptions = {}): UsePinInputReturn {
  const {
    length = PIN_LENGTH,
    onComplete,
    enableKeyboard = false,
    onEscape,
  } = options;

  const [code, setCode] = useState<string[]>(() => Array(length).fill(''));

  // 計算衍生狀態
  const pin = code.join('');
  const isFull = code.every(d => d !== '');
  const isEmpty = code.every(d => d === '');

  // 處理數字輸入
  const handleDigit = useCallback((digit: string) => {
    // 驗證輸入是否為數字
    if (!/^[0-9]$/.test(digit)) return;

    setCode((prev) => {
      const newCode = [...prev];
      const emptyIndex = newCode.findIndex((d) => d === '');
      if (emptyIndex !== -1) {
        newCode[emptyIndex] = digit;
      }
      return newCode;
    });
  }, []);

  // 處理退格
  const handleBackspace = useCallback(() => {
    setCode((prev) => {
      const newCode = [...prev];
      for (let i = newCode.length - 1; i >= 0; i--) {
        if (newCode[i] !== '') {
          newCode[i] = '';
          break;
        }
      }
      return newCode;
    });
  }, []);

  // 清除所有輸入
  const clear = useCallback(() => {
    setCode(Array(length).fill(''));
  }, [length]);

  // 重置（可帶延遲）
  const reset = useCallback((delay?: number) => {
    if (delay && delay > 0) {
      setTimeout(clear, delay);
    } else {
      clear();
    }
  }, [clear]);

  // 輸入完成時觸發回調
  useEffect(() => {
    if (isFull && onComplete) {
      onComplete(pin);
    }
  }, [isFull, pin, onComplete]);

  // 鍵盤事件監聽
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, handleDigit, handleBackspace, onEscape]);

  return {
    code,
    pin,
    isFull,
    isEmpty,
    handleDigit,
    handleBackspace,
    clear,
    reset,
  };
}

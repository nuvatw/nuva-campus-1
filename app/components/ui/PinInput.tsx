'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePinInput } from '@/app/hooks/usePinInput';
import { NumericKeypad } from './NumericKeypad';

interface PinInputProps {
  /** PIN 碼長度，預設 4 */
  length?: number;
  /** 輸入完成時的回調 */
  onComplete: (pin: string) => void;
  /** 錯誤狀態 */
  error?: boolean;
  /** 錯誤訊息 */
  errorMessage?: string;
  /** 載入中狀態 */
  loading?: boolean;
  /** 是否顯示數字鍵盤 */
  showKeypad?: boolean;
  /** 鍵盤大小 */
  keypadSize?: 'sm' | 'md' | 'lg';
  /** 標題 */
  title?: string;
  /** 副標題/說明 */
  subtitle?: string;
  /** 是否自動監聽鍵盤事件 */
  enableKeyboard?: boolean;
  /** ESC 鍵回調 */
  onEscape?: () => void;
  /** 清除 PIN 的外部控制 */
  clearTrigger?: number;
  /** 顯示模式：dot 或 number */
  displayMode?: 'dot' | 'number';
  /** 自動聚焦 */
  autoFocus?: boolean;
}

/**
 * PinInput - 統一的 PIN 碼輸入元件
 *
 * 整合了：
 * - PIN 碼顯示（圓點或數字）
 * - 數字鍵盤
 * - 鍵盤輸入支援
 * - 錯誤狀態處理
 * - 載入狀態
 *
 * @example
 * ```tsx
 * <PinInput
 *   onComplete={(pin) => verifyPassword(pin)}
 *   error={hasError}
 *   errorMessage="密碼錯誤"
 *   loading={isVerifying}
 * />
 * ```
 */
export function PinInput({
  length = 4,
  onComplete,
  error = false,
  errorMessage,
  loading = false,
  showKeypad = true,
  keypadSize = 'md',
  title,
  subtitle,
  enableKeyboard = true,
  onEscape,
  clearTrigger,
  displayMode = 'dot',
  autoFocus = false,
}: PinInputProps) {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  const {
    code,
    handleDigit,
    handleBackspace,
    clear,
  } = usePinInput({
    length,
    onComplete,
    enableKeyboard,
    onEscape,
  });

  // 外部清除觸發
  useEffect(() => {
    if (clearTrigger !== undefined && clearTrigger > 0) {
      clear();
    }
  }, [clearTrigger, clear]);

  // 錯誤時清除（帶延遲）
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clear, 300);
      return () => clearTimeout(timer);
    }
  }, [error, clear]);

  // 自動聚焦
  useEffect(() => {
    if (autoFocus && showKeypad) {
      setTimeout(() => firstButtonRef.current?.focus(), 100);
    }
  }, [autoFocus, showKeypad]);

  // 清除錯誤的包裝函數
  const handleDigitWithClear = useCallback((digit: string) => {
    handleDigit(digit);
  }, [handleDigit]);

  const filledCount = code.filter(d => d !== '').length;

  return (
    <div className="flex flex-col items-center">
      {/* 標題 */}
      {title && (
        <h2 className="text-xl font-medium text-text-primary text-center mb-2">
          {title}
        </h2>
      )}

      {/* 副標題 */}
      {subtitle && (
        <p className="text-text-secondary text-sm text-center mb-6">
          {subtitle}
        </p>
      )}

      {/* PIN 碼顯示 */}
      <div
        className={`flex justify-center gap-3 mb-6 ${error ? 'animate-shake' : ''}`}
        role="status"
        aria-label={`已輸入 ${filledCount} 位密碼`}
      >
        {code.map((digit, index) => (
          <div
            key={index}
            className={`
              w-14 h-16 rounded-lg border-2 flex items-center justify-center
              text-2xl font-semibold transition-all duration-200
              ${digit ? 'border-primary bg-bg-secondary' : 'border-border bg-bg-card'}
              ${error ? 'border-error' : ''}
            `}
            aria-hidden="true"
          >
            {digit ? (displayMode === 'dot' ? '●' : digit) : ''}
          </div>
        ))}
      </div>

      {/* 錯誤訊息 */}
      {error && errorMessage && (
        <p className="text-error text-sm text-center mb-4" role="alert">
          {errorMessage}
        </p>
      )}

      {/* 數字鍵盤 */}
      {showKeypad && (
        <NumericKeypad
          onDigit={handleDigitWithClear}
          onBackspace={handleBackspace}
          disabled={loading}
          size={keypadSize}
        />
      )}

      {/* 載入狀態 */}
      {loading && (
        <div className="flex justify-center mt-6" aria-live="polite">
          <div
            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <span className="sr-only">驗證中</span>
        </div>
      )}
    </div>
  );
}

/**
 * PinDisplay - 單純的 PIN 碼顯示元件
 *
 * 用於不需要鍵盤的場景
 */
export function PinDisplay({
  code,
  error = false,
  displayMode = 'dot',
}: {
  code: string[];
  error?: boolean;
  displayMode?: 'dot' | 'number';
}) {
  const filledCount = code.filter(d => d !== '').length;

  return (
    <div
      className={`flex justify-center gap-3 ${error ? 'animate-shake' : ''}`}
      role="status"
      aria-label={`已輸入 ${filledCount} 位密碼`}
    >
      {code.map((digit, index) => (
        <div
          key={index}
          className={`
            w-14 h-16 rounded-lg border-2 flex items-center justify-center
            text-2xl font-semibold transition-all duration-200
            ${digit ? 'border-primary bg-bg-secondary' : 'border-border bg-bg-card'}
            ${error ? 'border-error' : ''}
          `}
          aria-hidden="true"
        >
          {digit ? (displayMode === 'dot' ? '●' : digit) : ''}
        </div>
      ))}
    </div>
  );
}

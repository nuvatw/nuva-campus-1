'use client';

import { memo } from 'react';
import { Button } from './Button';
import type { ApiError } from '@/app/types/result';
import { ErrorCodes } from '@/app/types/result';

interface ErrorDisplayProps {
  /** API 錯誤物件 */
  error: ApiError;
  /** 重試回調函數 */
  onRetry?: () => void;
  /** 自訂 className */
  className?: string;
  /** 是否顯示為緊湊模式 */
  compact?: boolean;
}

/**
 * 根據錯誤碼取得對應的圖示和標題
 */
function getErrorMeta(code: string) {
  switch (code) {
    case ErrorCodes.NETWORK_ERROR:
      return {
        icon: (
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        ),
        title: '網路連線錯誤',
      };
    case ErrorCodes.NOT_FOUND:
      return {
        icon: (
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: '找不到資料',
      };
    case ErrorCodes.UNAUTHORIZED:
      return {
        icon: (
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ),
        title: '權限不足',
      };
    case ErrorCodes.TIMEOUT:
      return {
        icon: (
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: '請求超時',
      };
    default:
      return {
        icon: (
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        title: '發生錯誤',
      };
  }
}

/**
 * ErrorDisplay - 錯誤顯示組件
 *
 * 用於顯示 API 錯誤，提供友善的錯誤訊息和重試按鈕
 */
function ErrorDisplayComponent({
  error,
  onRetry,
  className = '',
  compact = false,
}: ErrorDisplayProps) {
  const { icon, title } = getErrorMeta(error.code);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-4 bg-error/5 border border-error/20 rounded-lg ${className}`}
        role="alert"
      >
        <div className="text-error flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary font-medium">{title}</p>
          <p className="text-xs text-text-secondary truncate">{error.message}</p>
        </div>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            重試
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      role="alert"
    >
      <div className="text-text-muted mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary mb-6 max-w-md">{error.message}</p>

      {onRetry && (
        <Button onClick={onRetry} variant="secondary" className="gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          重試
        </Button>
      )}
    </div>
  );
}

export const ErrorDisplay = memo(ErrorDisplayComponent);
export default ErrorDisplay;

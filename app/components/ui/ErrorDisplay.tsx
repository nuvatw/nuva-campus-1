'use client';

import { memo, useState } from 'react';
import { Button } from './Button';
import { FadeIn } from '@/app/components/motion';
import type { ApiError } from '@/app/types/result';
import { ErrorCodes } from '@/app/types/result';

interface ErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

interface ErrorMeta {
  icon: React.ReactNode;
  title: string;
  suggestion: string;
}

function getErrorMeta(code: string): ErrorMeta {
  switch (code) {
    case ErrorCodes.NETWORK_ERROR:
      return {
        icon: (
          <svg className="w-14 h-14" fill="none" viewBox="0 0 56 56" stroke="currentColor" strokeWidth="1.5">
            <circle cx="28" cy="28" r="22" opacity="0.15" fill="currentColor" stroke="none" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 20a16 16 0 0122 0" opacity="0.3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 26a10 10 0 0114 0" opacity="0.5" />
            <circle cx="28" cy="34" r="2" fill="currentColor" stroke="none" />
            <path strokeLinecap="round" d="M16 40l24-24" strokeWidth="2" opacity="0.6" />
          </svg>
        ),
        title: '網路連線中斷',
        suggestion: '請檢查網路連線後再試一次',
      };
    case ErrorCodes.NOT_FOUND:
      return {
        icon: (
          <svg className="w-14 h-14" fill="none" viewBox="0 0 56 56" stroke="currentColor" strokeWidth="1.5">
            <circle cx="28" cy="28" r="22" opacity="0.15" fill="currentColor" stroke="none" />
            <circle cx="28" cy="26" r="12" opacity="0.4" />
            <path strokeLinecap="round" d="M36 34l8 8" strokeWidth="2" opacity="0.4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M24 26h8" opacity="0.5" />
          </svg>
        ),
        title: '找不到資料',
        suggestion: '這筆資料可能已被移除或網址不正確',
      };
    case ErrorCodes.UNAUTHORIZED:
      return {
        icon: (
          <svg className="w-14 h-14" fill="none" viewBox="0 0 56 56" stroke="currentColor" strokeWidth="1.5">
            <circle cx="28" cy="28" r="22" opacity="0.15" fill="currentColor" stroke="none" />
            <rect x="20" y="26" width="16" height="12" rx="2" opacity="0.4" />
            <path d="M23 26v-4a5 5 0 0110 0v4" opacity="0.5" />
            <circle cx="28" cy="32" r="1.5" fill="currentColor" stroke="none" opacity="0.5" />
          </svg>
        ),
        title: '沒有存取權限',
        suggestion: '請確認您有權限存取此頁面',
      };
    case ErrorCodes.TIMEOUT:
      return {
        icon: (
          <svg className="w-14 h-14" fill="none" viewBox="0 0 56 56" stroke="currentColor" strokeWidth="1.5">
            <circle cx="28" cy="28" r="22" opacity="0.15" fill="currentColor" stroke="none" />
            <circle cx="28" cy="28" r="12" opacity="0.4" />
            <path strokeLinecap="round" d="M28 22v7l4 4" opacity="0.5" strokeWidth="2" />
          </svg>
        ),
        title: '請求逾時',
        suggestion: '伺服器回應時間過長，請稍候再試',
      };
    default:
      return {
        icon: (
          <svg className="w-14 h-14" fill="none" viewBox="0 0 56 56" stroke="currentColor" strokeWidth="1.5">
            <circle cx="28" cy="28" r="22" opacity="0.15" fill="currentColor" stroke="none" />
            <circle cx="28" cy="28" r="12" opacity="0.4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M28 24v5m0 4h.01" opacity="0.6" strokeWidth="2" />
          </svg>
        ),
        title: '哎呀，出了點問題',
        suggestion: '請稍候再試一次，或聯繫我們取得協助',
      };
  }
}

function ErrorDisplayComponent({
  error,
  onRetry,
  className = '',
  compact = false,
}: ErrorDisplayProps) {
  const { icon, title, suggestion } = getErrorMeta(error.code);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      onRetry();
    } finally {
      // Brief delay for visual feedback
      setTimeout(() => setRetrying(false), 600);
    }
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-3 p-4 bg-error/5 border border-error/20 rounded-xl ${className}`}
        role="alert"
      >
        <div className="text-error flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" opacity="0.2" fill="currentColor" stroke="none" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary font-medium">{title}</p>
          <p className="text-xs text-text-muted mt-0.5">{error.message}</p>
        </div>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={handleRetry} isLoading={retrying}>
            重試
          </Button>
        )}
      </div>
    );
  }

  return (
    <FadeIn>
      <div
        className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
        role="alert"
      >
        <div className="text-text-muted mb-5">{icon}</div>
        <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
        <p className="text-sm text-text-secondary mb-2 max-w-md">{error.message}</p>
        <p className="text-xs text-text-muted mb-8 max-w-sm">{suggestion}</p>

        <div className="flex items-center gap-3">
          {onRetry && (
            <Button onClick={handleRetry} variant="secondary" isLoading={retrying} className="gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              再試一次
            </Button>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

export const ErrorDisplay = memo(ErrorDisplayComponent);
export default ErrorDisplay;

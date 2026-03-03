'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary
 *
 * 捕獲所有未處理的錯誤，提供友善的錯誤頁面
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 記錄錯誤到監控服務
    console.error('Global error boundary caught:', error);
    // 未來可整合 Sentry 等服務
    // captureException(error)
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="max-w-md w-full text-center">
        {/* 錯誤圖示 */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-warning"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          發生錯誤
        </h1>

        <p className="text-text-secondary mb-6">
          很抱歉，頁面發生了一些問題。請嘗試重新載入或返回首頁。
        </p>

        {/* 開發模式顯示錯誤詳情 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-error/5 border border-error/20 rounded-lg p-4 text-left text-sm mb-6 overflow-auto max-h-48">
            <p className="font-mono text-error break-all">{error.message}</p>
            {error.stack && (
              <pre className="mt-2 text-xs text-text-muted whitespace-pre-wrap break-all">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重試
          </Button>

          <Link href="/">
            <Button variant="secondary" className="gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              返回首頁
            </Button>
          </Link>
        </div>

        {/* 錯誤代碼 */}
        {error.digest && (
          <p className="mt-6 text-xs text-text-muted">
            錯誤代碼: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

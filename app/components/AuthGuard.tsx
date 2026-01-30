'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { PasswordKey } from '@/app/types/password';
import { AuthStorage } from '@/app/utils/authStorage';
import { PinInput } from '@/app/components/ui/PinInput';
import { AuthGuardSkeleton } from './AuthGuardSkeleton';

interface AuthGuardProps {
  roleKey: PasswordKey;
  children: React.ReactNode;
  redirectOnFail?: string;
  title?: string;
}

/**
 * AuthGuard - 認證守衛元件
 *
 * 包裝需要認證的頁面，未驗證時顯示 PIN 輸入介面
 */
export function AuthGuard({
  roleKey,
  children,
  redirectOnFail = '/',
  title = '輸入通行密碼',
}: AuthGuardProps) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);

  // 初始檢查
  useEffect(() => {
    setIsVerified(AuthStorage.isVerified(roleKey));
  }, [roleKey]);

  // 驗證密碼
  const handleComplete = useCallback(async (pin: string) => {
    setIsVerifying(true);
    setError(false);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: roleKey, password: pin }),
      });

      const { success } = await res.json();

      if (success) {
        AuthStorage.setVerified(roleKey);
        setIsVerified(true);
      } else {
        setError(true);
        setClearTrigger(prev => prev + 1);
      }
    } catch {
      setError(true);
      setClearTrigger(prev => prev + 1);
    } finally {
      setIsVerifying(false);
    }
  }, [roleKey]);

  // 載入中 - 顯示 Skeleton 而非空白
  if (isVerified === null) {
    return <AuthGuardSkeleton />;
  }

  // 已驗證
  if (isVerified) {
    return <>{children}</>;
  }

  // 未驗證 - 顯示密碼輸入
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm" role="main" aria-labelledby="auth-title">
        {/* 返回按鈕 */}
        <button
          onClick={() => router.push(redirectOnFail)}
          aria-label="返回上一頁"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-8 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none rounded-lg p-1 -ml-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">返回</span>
        </button>

        {/* 標題 */}
        <h1 id="auth-title" className="text-2xl font-semibold text-text-primary text-center mb-8">
          {title}
        </h1>

        {/* PIN 輸入 */}
        <PinInput
          onComplete={handleComplete}
          error={error}
          errorMessage="密碼錯誤，請重新輸入"
          loading={isVerifying}
          enableKeyboard
          onEscape={() => router.push(redirectOnFail)}
          clearTrigger={clearTrigger}
        />
      </div>
    </div>
  );
}

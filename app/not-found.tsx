'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui';

/**
 * 404 Not Found 頁面
 *
 * 當使用者訪問不存在的頁面時顯示
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 圖示 */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bg-secondary flex items-center justify-center">
          <svg
            className="w-12 h-12 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* 404 數字 */}
        <h1 className="text-6xl font-bold text-text-muted mb-2">404</h1>

        <h2 className="text-xl font-medium text-text-primary mb-4">
          找不到頁面
        </h2>

        <p className="text-text-secondary mb-8">
          您要找的頁面不存在或已被移除。
          <br />
          請確認網址是否正確，或返回首頁。
        </p>

        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              返回首頁
            </Button>
          </Link>

          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回上一頁
          </Button>
        </div>
      </div>
    </div>
  );
}

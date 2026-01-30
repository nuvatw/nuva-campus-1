/**
 * Server Data Provider 模式
 *
 * 用於在 Server Components 中預取資料，
 * 然後傳遞給 Client Components
 */

import { Suspense, ReactNode } from 'react';

interface AsyncBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  errorFallback?: ReactNode;
}

/**
 * AsyncBoundary - Suspense + Error 邊界包裝
 *
 * 用於包裝 async Server Components
 */
export function AsyncBoundary({
  children,
  fallback,
  errorFallback,
}: AsyncBoundaryProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

/**
 * DataProvider Props 類型生成器
 */
export interface DataProviderProps<T> {
  data: T;
  children?: ReactNode;
}

/**
 * 建立帶有 Suspense 的資料區塊
 *
 * @example
 * ```tsx
 * // Server Component
 * export default async function Page() {
 *   return (
 *     <AsyncBoundary fallback={<DashboardSkeleton />}>
 *       <DashboardData />
 *     </AsyncBoundary>
 *   );
 * }
 *
 * async function DashboardData() {
 *   const data = await fetchDashboardStats();
 *   return <DashboardClient data={data} />;
 * }
 * ```
 */

/**
 * 條件渲染輔助元件
 */
export function DataContainer<T>({
  data,
  loading,
  error,
  children,
  loadingFallback,
  errorFallback,
  emptyFallback,
  isEmpty,
}: {
  data: T | undefined | null;
  loading?: boolean;
  error?: Error | null;
  children: (data: T) => ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  emptyFallback?: ReactNode;
  isEmpty?: (data: T) => boolean;
}) {
  if (loading) {
    return <>{loadingFallback || <DefaultLoading />}</>;
  }

  if (error) {
    return <>{errorFallback || <DefaultError error={error} />}</>;
  }

  if (!data) {
    return <>{emptyFallback || null}</>;
  }

  if (isEmpty && isEmpty(data)) {
    return <>{emptyFallback || null}</>;
  }

  return <>{children(data)}</>;
}

function DefaultLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function DefaultError({ error }: { error: Error }) {
  return (
    <div className="text-center py-12">
      <p className="text-error">發生錯誤</p>
      <p className="text-text-muted text-sm mt-1">{error.message}</p>
    </div>
  );
}

/**
 * 延遲渲染元件
 *
 * 用於 stagger 動畫效果
 */
export function StaggeredList<T>({
  items,
  renderItem,
  delay = 50,
  className = '',
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            animationDelay: `${index * delay}ms`,
          }}
          className="animate-fade-in-up"
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

/**
 * 重新驗證觸發器
 *
 * 用於 Client Component 觸發 Server Component 重新獲取資料
 */
export function useRevalidate(path: string) {
  return async () => {
    try {
      await fetch(`/api/revalidate?path=${encodeURIComponent(path)}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Revalidation failed:', error);
    }
  };
}

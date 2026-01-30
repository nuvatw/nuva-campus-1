'use client';

import useSWR, { SWRConfiguration } from 'swr';
import type { ApiError, Result } from '@/app/types/result';

interface UseDataOptions<T> extends SWRConfiguration {
  /** 預設資料（在載入時使用） */
  fallbackData?: T;
}

interface UseDataReturn<T> {
  /** 資料 */
  data: T | undefined;
  /** API 錯誤 */
  error: ApiError | undefined;
  /** 是否正在載入 */
  isLoading: boolean;
  /** 是否正在重新驗證 */
  isValidating: boolean;
  /** 是否為空資料 */
  isEmpty: boolean;
  /** 重新載入資料 */
  mutate: () => void;
  /** 重試（清除錯誤並重新載入） */
  retry: () => void;
}

/**
 * useData - 統一的資料獲取 Hook
 *
 * 封裝 SWR 並整合 Result 型別的錯誤處理
 *
 * @example
 * ```tsx
 * const { data, error, isLoading, retry } = useData(
 *   'events',
 *   () => fetchEvents(),
 *   { refreshInterval: 30000 }
 * );
 *
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorDisplay error={error} onRetry={retry} />;
 * if (isEmpty) return <EmptyState />;
 * return <EventList events={data} />;
 * ```
 */
export function useData<T>(
  key: string | null,
  fetcher: () => Promise<Result<T, ApiError>>,
  options?: UseDataOptions<T>
): UseDataReturn<T> {
  const {
    data: result,
    error: swrError,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(
    key,
    async () => {
      const result = await fetcher();
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    {
      ...options,
      fallbackData: options?.fallbackData,
      // 錯誤時不自動重試，讓使用者手動重試
      shouldRetryOnError: false,
    }
  );

  // 判斷是否為空資料
  const isEmpty = !isLoading && !swrError && (
    result === undefined ||
    result === null ||
    (Array.isArray(result) && result.length === 0)
  );

  // 重試函數
  const retry = () => {
    mutate();
  };

  return {
    data: result,
    error: swrError as ApiError | undefined,
    isLoading,
    isValidating,
    isEmpty,
    mutate,
    retry,
  };
}

/**
 * useDataList - 專門用於列表資料的 Hook
 *
 * 自動處理空陣列的情況
 */
export function useDataList<T>(
  key: string | null,
  fetcher: () => Promise<Result<T[], ApiError>>,
  options?: UseDataOptions<T[]>
): UseDataReturn<T[]> & { items: T[] } {
  const result = useData(key, fetcher, {
    ...options,
    fallbackData: options?.fallbackData ?? [],
  });

  return {
    ...result,
    items: result.data ?? [],
  };
}

export default useData;

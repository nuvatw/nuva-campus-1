/**
 * 統一的操作結果型別
 * 參考 Rust 的 Result 模式，讓錯誤處理更明確
 */

/**
 * Result 型別 - 成功或失敗
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * API 錯誤型別
 */
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

/**
 * 常見錯誤碼
 */
export const ErrorCodes = {
  /** 網路連線錯誤 */
  NETWORK_ERROR: 'NETWORK_ERROR',
  /** 找不到資源 */
  NOT_FOUND: 'NOT_FOUND',
  /** 未授權或權限不足 */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** 資料驗證錯誤 */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** 伺服器錯誤 */
  SERVER_ERROR: 'SERVER_ERROR',
  /** 請求超時 */
  TIMEOUT: 'TIMEOUT',
  /** 未知錯誤 */
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * 錯誤碼對應的預設訊息
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.NETWORK_ERROR]: '網路連線錯誤，請檢查網路後再試',
  [ErrorCodes.NOT_FOUND]: '找不到您要的資料',
  [ErrorCodes.UNAUTHORIZED]: '您沒有權限執行此操作',
  [ErrorCodes.VALIDATION_ERROR]: '資料格式不正確',
  [ErrorCodes.SERVER_ERROR]: '伺服器發生錯誤，請稍後再試',
  [ErrorCodes.TIMEOUT]: '請求超時，請稍後再試',
  [ErrorCodes.UNKNOWN]: '發生未知錯誤',
};

/**
 * 建立 API 錯誤
 */
export function createApiError(
  code: ErrorCode,
  message?: string,
  details?: Record<string, unknown>,
  statusCode?: number
): ApiError {
  return {
    code,
    message: message || ErrorMessages[code],
    details,
    statusCode,
  };
}

/**
 * 成功結果
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * 失敗結果
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * 從 Supabase 錯誤建立 ApiError
 */
export function fromSupabaseError(
  error: { code?: string; message: string },
  defaultMessage?: string
): ApiError {
  // 處理常見的 Supabase 錯誤碼
  if (error.code === 'PGRST116') {
    return createApiError(ErrorCodes.NOT_FOUND, '找不到資料');
  }
  if (error.code === '23505') {
    return createApiError(ErrorCodes.VALIDATION_ERROR, '資料已存在');
  }
  if (error.code === '42501') {
    return createApiError(ErrorCodes.UNAUTHORIZED, '權限不足');
  }

  return createApiError(
    ErrorCodes.SERVER_ERROR,
    defaultMessage || error.message
  );
}

/**
 * 檢查是否為網路錯誤
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true;
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }
  return false;
}

/**
 * 安全地執行 async 函數並返回 Result
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<Result<T, ApiError>> {
  try {
    const data = await fn();
    return ok(data);
  } catch (error) {
    console.error('[tryCatch] Error:', error);

    if (isNetworkError(error)) {
      return err(createApiError(ErrorCodes.NETWORK_ERROR));
    }

    if (error instanceof Error) {
      return err(
        createApiError(ErrorCodes.UNKNOWN, errorMessage || error.message)
      );
    }

    return err(createApiError(ErrorCodes.UNKNOWN, errorMessage));
  }
}

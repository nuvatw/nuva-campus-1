interface RateLimitRecord {
  count: number;
  timestamp: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * 記憶體中的速率限制記錄
 * 注意：在 serverless 環境中，這個 Map 可能會在不同的實例之間不共享
 * 對於生產環境，建議使用 Redis 或其他分散式快取
 */
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * 清理過期的速率限制記錄
 * 建議定期呼叫以避免記憶體洩漏
 */
function cleanupExpiredRecords(windowMs: number): void {
  const now = Date.now();

  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.timestamp > windowMs) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * 檢查速率限制
 * @param identifier 識別符（通常是 IP 地址或 API Key）
 * @param limit 時間窗口內允許的最大請求數
 * @param windowMs 時間窗口（毫秒）
 * @returns 速率限制檢查結果
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // 定期清理過期記錄（每 100 次請求清理一次）
  if (rateLimitMap.size > 100 && Math.random() < 0.01) {
    cleanupExpiredRecords(windowMs);
  }

  // 如果沒有記錄或記錄已過期，建立新記錄
  if (!record || now - record.timestamp > windowMs) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  // 如果已達到限制
  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.timestamp + windowMs,
    };
  }

  // 增加計數
  record.count++;

  return {
    allowed: true,
    remaining: limit - record.count,
    resetAt: record.timestamp + windowMs,
  };
}

/**
 * 建立速率限制中間件配置
 */
export interface RateLimitConfig {
  limit: number;
  windowMs: number;
  keyGenerator?: (request: Request) => string;
}

/**
 * 預設的 key 生成器
 * 使用 X-Forwarded-For 標頭或 'unknown'
 */
export function defaultKeyGenerator(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

/**
 * 檢查請求的速率限制
 * 如果超過限制，返回 429 錯誤回應
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  const { limit, windowMs, keyGenerator = defaultKeyGenerator } = config;

  return async (request: Request) => {
    const key = keyGenerator(request);
    const result = checkRateLimit(key, limit, windowMs);

    if (!result.allowed) {
      return {
        limited: true,
        response: new Response(
          JSON.stringify({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetAt - Date.now()) / 1000)} seconds.`,
            retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
              'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            },
          }
        ),
      };
    }

    return {
      limited: false,
      remaining: result.remaining,
      resetAt: result.resetAt,
    };
  };
}

/**
 * 重置特定識別符的速率限制
 * 用於管理員操作或測試
 */
export function resetRateLimit(identifier: string): boolean {
  return rateLimitMap.delete(identifier);
}

/**
 * 獲取當前速率限制狀態
 * 用於除錯或監控
 */
export function getRateLimitStatus(identifier: string): RateLimitRecord | undefined {
  return rateLimitMap.get(identifier);
}

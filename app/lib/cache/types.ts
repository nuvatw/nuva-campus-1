/**
 * 快取系統類型定義
 */

/** 快取項目 */
export interface CacheItem<T> {
  /** 快取的資料 */
  data: T;
  /** 建立時間戳 */
  createdAt: number;
  /** 過期時間戳 */
  expiresAt: number;
  /** 快取標籤（用於批量失效） */
  tags?: string[];
}

/** TTL 配置（秒） */
export interface TTLConfig {
  /** L1 記憶體快取 TTL */
  l1: number;
  /** L2 分散式快取 TTL（預留給 Redis） */
  l2?: number;
}

/** 快取策略 */
export interface CacheStrategy {
  /** TTL 配置 */
  ttl: TTLConfig;
  /** 是否啟用 stale-while-revalidate */
  staleWhileRevalidate?: boolean;
  /** 快取標籤 */
  tags?: string[];
  /** 是否跳過快取 */
  skipCache?: boolean;
}

/** 快取鍵生成器 */
export type CacheKeyGenerator<T extends unknown[]> = (...args: T) => string;

/** 快取操作選項 */
export interface CacheOptions {
  /** 強制刷新（跳過讀取快取） */
  forceRefresh?: boolean;
  /** 跳過寫入快取 */
  skipWrite?: boolean;
}

/** 快取統計 */
export interface CacheStats {
  /** 命中次數 */
  hits: number;
  /** 未命中次數 */
  misses: number;
  /** 當前項目數 */
  size: number;
  /** 命中率 */
  hitRate: number;
}

/** 快取管理器介面 */
export interface ICacheManager {
  /** 取得快取值 */
  get<T>(key: string): T | null;
  /** 設置快取值 */
  set<T>(key: string, value: T, strategy: CacheStrategy): void;
  /** 刪除快取值 */
  delete(key: string): void;
  /** 清除所有快取 */
  clear(): void;
  /** 依標籤失效快取 */
  invalidateByTag(tag: string): void;
  /** 取得統計資訊 */
  getStats(): CacheStats;
}

/** 資料獲取器類型 */
export type Fetcher<T> = () => Promise<T>;

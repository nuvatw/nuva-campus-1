/**
 * 快取管理器
 *
 * 統一的快取 API，整合 LRU 記憶體快取
 * 未來可擴展支援 Redis 作為 L2 快取
 */

import { LRUCache, getGlobalCache } from './lru';
import type { CacheStrategy, CacheOptions, CacheStats, Fetcher } from './types';

/**
 * 快取管理器
 *
 * 提供帶有 fetcher 的快取操作，自動處理快取 miss 時的資料獲取
 */
export class CacheManager {
  private cache: LRUCache;

  constructor(cache?: LRUCache) {
    this.cache = cache || getGlobalCache();
  }

  /**
   * 取得快取值，若不存在則執行 fetcher 並快取結果
   *
   * @param key 快取鍵
   * @param fetcher 資料獲取函數
   * @param strategy 快取策略
   * @param options 額外選項
   */
  async get<T>(
    key: string,
    fetcher: Fetcher<T>,
    strategy: CacheStrategy,
    options: CacheOptions = {}
  ): Promise<T> {
    // 跳過快取
    if (strategy.skipCache || options.forceRefresh) {
      const data = await fetcher();
      if (!options.skipWrite && !strategy.skipCache) {
        this.set(key, data, strategy);
      }
      return data;
    }

    // 嘗試從快取取得
    const cached = this.cache.get(key) as T | null;
    if (cached !== null) {
      return cached;
    }

    // 快取 miss，執行 fetcher
    const data = await fetcher();

    // 寫入快取
    if (!options.skipWrite) {
      this.set(key, data, strategy);
    }

    return data;
  }

  /**
   * 直接設置快取值
   */
  set<T>(key: string, value: T, strategy: CacheStrategy): void {
    if (strategy.skipCache) return;
    this.cache.set(key, value, strategy.ttl.l1, strategy.tags);
  }

  /**
   * 取得快取值（不觸發 fetcher）
   */
  peek<T>(key: string): T | null {
    return this.cache.get(key) as T | null;
  }

  /**
   * 刪除快取值
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清除所有快取
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 依標籤失效快取
   */
  invalidateByTag(tag: string): number {
    return this.cache.invalidateByTag(tag);
  }

  /**
   * 批量失效多個標籤
   */
  invalidateByTags(tags: string[]): number {
    let total = 0;
    for (const tag of tags) {
      total += this.invalidateByTag(tag);
    }
    return total;
  }

  /**
   * 取得統計資訊
   */
  getStats(): CacheStats {
    return this.cache.getStats();
  }

  /**
   * 執行清理
   */
  cleanup(): number {
    return this.cache.cleanup();
  }
}

// 全域快取管理器實例
let globalCacheManager: CacheManager | null = null;

/**
 * 取得全域快取管理器
 */
export function getCacheManager(): CacheManager {
  if (!globalCacheManager) {
    globalCacheManager = new CacheManager();
  }
  return globalCacheManager;
}

/**
 * 快取裝飾器工廠
 *
 * 用於簡化服務方法的快取包裝
 *
 * @example
 * ```ts
 * const cachedGetById = withCache(
 *   (id: string) => `event:${id}`,
 *   CACHE_STRATEGIES.events
 * );
 *
 * // 在服務中使用
 * async getById(id: string) {
 *   return cachedGetById(id, () => this.fetchFromDb(id));
 * }
 * ```
 */
export function withCache<Args extends unknown[], Result>(
  keyGenerator: (...args: Args) => string,
  strategy: CacheStrategy
) {
  const manager = getCacheManager();

  return async (args: Args, fetcher: Fetcher<Result>, options?: CacheOptions): Promise<Result> => {
    const key = keyGenerator(...args);
    return manager.get(key, fetcher, strategy, options);
  };
}

/**
 * 失效相關快取的輔助函數
 *
 * @example
 * ```ts
 * // 當活動更新時，失效相關快取
 * invalidateEventCache(eventId);
 * ```
 */
export function invalidateEventCache(eventId?: string): void {
  const manager = getCacheManager();

  if (eventId) {
    // 失效特定活動的快取
    manager.delete(`event:${eventId}`);
    manager.delete(`event:stats:${eventId}`);
    manager.delete(`registrations:event:${eventId}`);
  }

  // 失效列表快取
  manager.invalidateByTag('events');
  manager.invalidateByTag('stats');
}

/**
 * 失效工作坊相關快取
 */
export function invalidateWorkshopCache(workshopId?: string): void {
  const manager = getCacheManager();

  if (workshopId) {
    manager.delete(`workshop:${workshopId}`);
    manager.delete(`workshop:stats:${workshopId}`);
  }

  manager.invalidateByTag('workshops');
}

/**
 * 失效報名相關快取
 */
export function invalidateRegistrationCache(eventId: string): void {
  const manager = getCacheManager();
  manager.delete(`registrations:event:${eventId}`);
  manager.delete(`event:stats:${eventId}`);
  manager.invalidateByTag('registrations');
  manager.invalidateByTag('stats');
}

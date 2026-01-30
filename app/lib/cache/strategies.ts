/**
 * 快取策略配置
 *
 * 定義各資料類型的快取行為
 */

import type { CacheStrategy } from './types';

/**
 * 預定義快取策略
 */
export const CACHE_STRATEGIES = {
  /**
   * 活動資料快取策略
   * - L1: 5 分鐘（記憶體）
   * - L2: 15 分鐘（預留給 Redis）
   * - 適用於活動列表、活動詳情
   */
  events: {
    ttl: { l1: 300, l2: 900 },
    staleWhileRevalidate: true,
    tags: ['events'],
  } satisfies CacheStrategy,

  /**
   * 活動統計快取策略
   * - L1: 1 分鐘
   * - L2: 3 分鐘
   * - 較短的 TTL 因為統計資料變化頻繁
   */
  eventStats: {
    ttl: { l1: 60, l2: 180 },
    staleWhileRevalidate: true,
    tags: ['events', 'stats'],
  } satisfies CacheStrategy,

  /**
   * 報名資料快取策略
   * - L1: 30 秒
   * - L2: 1 分鐘
   * - 較短的 TTL 因為報名狀態可能即時變化
   */
  registrations: {
    ttl: { l1: 30, l2: 60 },
    staleWhileRevalidate: true,
    tags: ['registrations'],
  } satisfies CacheStrategy,

  /**
   * 工作坊資料快取策略
   * - L1: 10 分鐘
   * - L2: 30 分鐘
   * - 較長的 TTL 因為工作坊資料變化不頻繁
   */
  workshops: {
    ttl: { l1: 600, l2: 1800 },
    staleWhileRevalidate: true,
    tags: ['workshops'],
  } satisfies CacheStrategy,

  /**
   * Dashboard 統計快取策略
   * - L1: 30 秒
   * - L2: 1 分鐘
   * - 較短的 TTL 用於即時儀表板
   */
  dashboardStats: {
    ttl: { l1: 30, l2: 60 },
    staleWhileRevalidate: true,
    tags: ['dashboard', 'stats'],
  } satisfies CacheStrategy,

  /**
   * 任務資料快取策略
   * - L1: 2 分鐘
   * - L2: 5 分鐘
   */
  missions: {
    ttl: { l1: 120, l2: 300 },
    staleWhileRevalidate: true,
    tags: ['missions'],
  } satisfies CacheStrategy,

  /**
   * 不快取策略
   * - 用於需要即時資料的操作
   */
  noCache: {
    ttl: { l1: 0 },
    skipCache: true,
  } satisfies CacheStrategy,
} as const;

/**
 * 快取標籤常數
 */
export const CACHE_TAGS = {
  EVENTS: 'events',
  REGISTRATIONS: 'registrations',
  WORKSHOPS: 'workshops',
  MISSIONS: 'missions',
  STATS: 'stats',
  DASHBOARD: 'dashboard',
} as const;

/**
 * 快取鍵前綴
 */
export const CACHE_KEY_PREFIX = {
  EVENT: 'event:',
  EVENT_STATS: 'event:stats:',
  EVENT_LIST: 'events:list:',
  REGISTRATION: 'registration:',
  REGISTRATION_LIST: 'registrations:event:',
  WORKSHOP: 'workshop:',
  WORKSHOP_LIST: 'workshops:list',
  WORKSHOP_STATS: 'workshop:stats:',
  DASHBOARD: 'dashboard:',
} as const;

/**
 * 產生快取鍵
 */
export function generateCacheKey(prefix: string, ...parts: (string | number | undefined)[]): string {
  const validParts = parts.filter(p => p !== undefined && p !== null);
  if (validParts.length === 0) {
    return prefix.replace(/:$/, '');
  }
  return `${prefix}${validParts.join(':')}`;
}

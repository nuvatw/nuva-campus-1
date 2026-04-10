/**
 * LRU (Least Recently Used) 記憶體快取
 *
 * 作為 L1 快取層，提供快速的記憶體存取
 */

import type { CacheItem, CacheStats, TTLConfig } from './types';

interface LRUNode<T> {
  key: string;
  item: CacheItem<T>;
  prev: LRUNode<T> | null;
  next: LRUNode<T> | null;
}

/**
 * LRU 快取實作
 *
 * 特性:
 * - O(1) 的 get/set 操作
 * - 自動過期清理
 * - 標籤式批量失效
 * - 容量限制與 LRU 淘汰
 */
export class LRUCache<T = unknown> {
  private cache: Map<string, LRUNode<T>> = new Map();
  private head: LRUNode<T> | null = null;
  private tail: LRUNode<T> | null = null;
  private maxSize: number;

  // 統計資訊
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * 取得快取值
   */
  get(key: string): T | null {
    const node = this.cache.get(key);

    if (!node) {
      this.misses++;
      return null;
    }

    // 檢查是否過期
    if (Date.now() > node.item.expiresAt) {
      this.delete(key);
      this.misses++;
      return null;
    }

    // 移動到頭部（最近使用）
    this.moveToHead(node);
    this.hits++;

    return node.item.data;
  }

  /**
   * 設置快取值
   */
  set(key: string, data: T, ttlSeconds: number, tags?: string[]): void {
    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      createdAt: now,
      expiresAt: now + ttlSeconds * 1000,
      tags,
    };

    const existingNode = this.cache.get(key);

    if (existingNode) {
      // 更新現有節點
      existingNode.item = item;
      this.moveToHead(existingNode);
    } else {
      // 建立新節點
      const newNode: LRUNode<T> = {
        key,
        item,
        prev: null,
        next: null,
      };

      this.cache.set(key, newNode);
      this.addToHead(newNode);

      // 檢查容量
      if (this.cache.size > this.maxSize) {
        this.removeTail();
      }
    }
  }

  /**
   * 刪除快取值
   */
  delete(key: string): boolean {
    const node = this.cache.get(key);
    if (!node) return false;

    this.removeNode(node);
    this.cache.delete(key);
    return true;
  }

  /**
   * 清除所有快取
   */
  clear(): void {
    this.cache.clear();
    this.head = null;
    this.tail = null;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * 依標籤失效快取
   */
  invalidateByTag(tag: string): number {
    let invalidated = 0;
    const keysToDelete: string[] = [];

    for (const [key, node] of this.cache) {
      if (node.item.tags?.includes(tag)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
      invalidated++;
    }

    return invalidated;
  }

  /**
   * 清理過期項目
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, node] of this.cache) {
      if (now > node.item.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
      cleaned++;
    }

    return cleaned;
  }

  /**
   * 取得統計資訊
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /**
   * 取得所有鍵
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 取得快取大小
   */
  get size(): number {
    return this.cache.size;
  }

  // === 私有方法 ===

  private addToHead(node: LRUNode<T>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }

    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: LRUNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  private moveToHead(node: LRUNode<T>): void {
    if (node === this.head) return;
    this.removeNode(node);
    this.addToHead(node);
  }

  private removeTail(): void {
    if (!this.tail) return;
    const tailKey = this.tail.key;
    this.removeNode(this.tail);
    this.cache.delete(tailKey);
  }
}

/** 全域 LRU 快取實例（用於伺服器端） */
let globalCache: LRUCache | null = null;

/**
 * 取得全域 LRU 快取實例
 */
export function getGlobalCache(maxSize = 1000): LRUCache {
  if (!globalCache) {
    globalCache = new LRUCache(maxSize);

    // 定期清理過期項目（每 5 分鐘）
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        globalCache?.cleanup();
      }, 5 * 60 * 1000);
    }
  }
  return globalCache;
}

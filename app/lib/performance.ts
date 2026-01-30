/**
 * 效能監控工具
 *
 * 用於追蹤和報告效能指標
 */

/** Core Web Vitals 指標 */
export interface WebVitals {
  /** Largest Contentful Paint */
  LCP?: number;
  /** First Input Delay */
  FID?: number;
  /** Cumulative Layout Shift */
  CLS?: number;
  /** First Contentful Paint */
  FCP?: number;
  /** Time to First Byte */
  TTFB?: number;
  /** Interaction to Next Paint */
  INP?: number;
}

/** 效能指標等級 */
type MetricRating = 'good' | 'needs-improvement' | 'poor';

/** 效能閾值 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

/**
 * 評估指標等級
 */
export function rateMetric(
  name: keyof typeof THRESHOLDS,
  value: number
): MetricRating {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * 報告 Web Vitals (用於 Next.js reportWebVitals)
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * export function reportWebVitals(metric: NextWebVitalsMetric) {
 *   reportMetric(metric);
 * }
 * ```
 */
export function reportMetric(metric: {
  name: string;
  value: number;
  id: string;
  startTime?: number;
  label?: string;
}) {
  // 在開發環境中輸出到 console
  if (process.env.NODE_ENV === 'development') {
    const rating = THRESHOLDS[metric.name as keyof typeof THRESHOLDS]
      ? rateMetric(metric.name as keyof typeof THRESHOLDS, metric.value)
      : 'unknown';

    const colors = {
      good: '\x1b[32m', // green
      'needs-improvement': '\x1b[33m', // yellow
      poor: '\x1b[31m', // red
      unknown: '\x1b[37m', // white
    };

    console.log(
      `${colors[rating]}[${metric.name}] ${metric.value.toFixed(2)}ms (${rating})\x1b[0m`
    );
  }

  // 在生產環境中發送到分析服務
  if (process.env.NODE_ENV === 'production') {
    // 可以整合 Vercel Analytics, Google Analytics, 或自訂服務
    // 例如: sendToAnalytics(metric);
  }
}

/**
 * 測量函數執行時間
 */
export function measureTime<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * 測量 async 函數執行時間
 */
export async function measureTimeAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Perf] ${name}: ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * 快取效能追蹤器
 */
export class CachePerformanceTracker {
  private hits = 0;
  private misses = 0;
  private totalFetchTime = 0;
  private fetchCount = 0;

  recordHit() {
    this.hits++;
  }

  recordMiss() {
    this.misses++;
  }

  recordFetch(duration: number) {
    this.totalFetchTime += duration;
    this.fetchCount++;
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      avgFetchTime: this.fetchCount > 0 ? this.totalFetchTime / this.fetchCount : 0,
    };
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
    this.totalFetchTime = 0;
    this.fetchCount = 0;
  }

  log() {
    const stats = this.getStats();
    console.log('[Cache Stats]', {
      ...stats,
      hitRatePercent: `${(stats.hitRate * 100).toFixed(1)}%`,
      avgFetchTimeMs: `${stats.avgFetchTime.toFixed(2)}ms`,
    });
  }
}

// 全域快取追蹤器實例
export const cacheTracker = new CachePerformanceTracker();

/**
 * 效能優化建議生成器
 */
export function getOptimizationSuggestions(vitals: WebVitals): string[] {
  const suggestions: string[] = [];

  if (vitals.LCP && vitals.LCP > THRESHOLDS.LCP.good) {
    suggestions.push('考慮優化圖片大小和格式，使用 next/image');
    suggestions.push('預載入關鍵資源');
  }

  if (vitals.FID && vitals.FID > THRESHOLDS.FID.good) {
    suggestions.push('減少主執行緒阻塞時間');
    suggestions.push('考慮使用 Web Workers 處理重計算');
  }

  if (vitals.CLS && vitals.CLS > THRESHOLDS.CLS.good) {
    suggestions.push('為圖片和影片設定明確尺寸');
    suggestions.push('避免動態插入內容造成版面位移');
  }

  if (vitals.TTFB && vitals.TTFB > THRESHOLDS.TTFB.good) {
    suggestions.push('考慮使用 CDN');
    suggestions.push('優化伺服器端渲染時間');
    suggestions.push('增加快取策略');
  }

  return suggestions;
}

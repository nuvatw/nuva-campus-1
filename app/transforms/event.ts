/**
 * 活動資料轉換函數
 *
 * 統一活動資料的格式化和轉換邏輯
 */

import type { Event, EventWithStats } from '@/app/services/events.service';

/** 活動狀態顯示 */
export type EventStatusDisplay = 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'draft';

/** 活動顯示資料 */
export interface EventDisplay {
  id: string;
  title: string;
  type: string;
  typeLabel: string;
  date: string;
  dateFormatted: string;
  time: string;
  location: string;
  status: EventStatusDisplay;
  statusLabel: string;
  statusVariant: 'default' | 'success' | 'warning' | 'error' | 'info';
}

/** 活動統計顯示資料 */
export interface EventStatsDisplay extends EventDisplay {
  stats: {
    registered: number;
    checkedIn: number;
    attendanceRate: number;
    lunchRequired: number;
    lunchCollected: number;
    lunchRate: number;
  };
}

/** 活動類型對應表 */
const EVENT_TYPE_LABELS: Record<string, string> = {
  workshop: '工作坊',
  mission: '任務',
  nunu_activity: 'Nunu 活動',
  other: '其他',
};

/** 活動狀態對應表 */
const EVENT_STATUS_CONFIG: Record<string, { label: string; variant: EventStatsDisplay['statusVariant'] }> = {
  draft: { label: '草稿', variant: 'default' },
  published: { label: '已發布', variant: 'info' },
  ongoing: { label: '進行中', variant: 'warning' },
  completed: { label: '已結束', variant: 'success' },
  cancelled: { label: '已取消', variant: 'error' },
};

/**
 * 格式化日期
 */
export function formatEventDate(date: string | null): string {
  if (!date) return '未定';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  } catch {
    return date;
  }
}

/**
 * 格式化時間範圍
 */
export function formatEventTime(startTime: string | null, endTime: string | null): string {
  if (!startTime) return '未定';
  const start = startTime.slice(0, 5);
  const end = endTime?.slice(0, 5);
  return end ? `${start} - ${end}` : start;
}

/**
 * 計算出席率
 */
export function calculateAttendanceRate(checkedIn: number, registered: number): number {
  if (registered === 0) return 0;
  return Math.round((checkedIn / registered) * 100);
}

/**
 * 取得活動類型標籤
 */
export function getEventTypeLabel(type: string): string {
  return EVENT_TYPE_LABELS[type] || type;
}

/**
 * 取得活動狀態配置
 */
export function getEventStatusConfig(status: string) {
  return EVENT_STATUS_CONFIG[status] || { label: status, variant: 'default' as const };
}

/**
 * 轉換活動為顯示格式
 */
export function transformEventForDisplay(event: Event): EventDisplay {
  const statusConfig = getEventStatusConfig(event.status);

  return {
    id: event.id,
    title: event.title,
    type: event.type,
    typeLabel: getEventTypeLabel(event.type),
    date: event.date || '',
    dateFormatted: formatEventDate(event.date),
    time: formatEventTime(event.start_time, event.end_time),
    location: event.location || '線上',
    status: event.status as EventStatusDisplay,
    statusLabel: statusConfig.label,
    statusVariant: statusConfig.variant,
  };
}

/**
 * 轉換活動含統計為顯示格式
 */
export function transformEventWithStatsForDisplay(event: EventWithStats): EventStatsDisplay {
  const base = transformEventForDisplay(event);
  const attendanceRate = calculateAttendanceRate(event.checkedInCount, event.registrationCount);
  const lunchRate = event.lunchRequiredCount > 0
    ? Math.round((event.lunchCollectedCount / event.lunchRequiredCount) * 100)
    : 0;

  return {
    ...base,
    stats: {
      registered: event.registrationCount,
      checkedIn: event.checkedInCount,
      attendanceRate,
      lunchRequired: event.lunchRequiredCount,
      lunchCollected: event.lunchCollectedCount,
      lunchRate,
    },
  };
}

/**
 * 批量轉換活動列表
 */
export function transformEventsForList(events: Event[]): EventDisplay[] {
  return events.map(transformEventForDisplay);
}

/**
 * 批量轉換活動含統計列表
 */
export function transformEventsWithStatsForList(events: EventWithStats[]): EventStatsDisplay[] {
  return events.map(transformEventWithStatsForDisplay);
}

/**
 * 根據狀態過濾活動
 */
export function filterEventsByStatus(events: EventDisplay[], status: EventStatusDisplay): EventDisplay[] {
  return events.filter(e => e.status === status);
}

/**
 * 根據日期排序活動
 */
export function sortEventsByDate(events: EventDisplay[], ascending = true): EventDisplay[] {
  return [...events].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * 工作坊資料轉換函數
 *
 * 統一工作坊資料的格式化和轉換邏輯
 */

import type { Workshop, WorkshopWithStats } from '@/app/services/workshops.service';

/** 工作坊類型顯示 */
export type WorkshopTypeDisplay = 'online' | 'offline' | 'hybrid';

/** 工作坊狀態顯示 */
export type WorkshopStatusDisplay = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

/** 工作坊顯示資料 */
export interface WorkshopDisplay {
  id: string;
  title: string;
  type: WorkshopTypeDisplay;
  typeLabel: string;
  typeIcon: 'video' | 'location' | 'hybrid';
  date: string;
  dateFormatted: string;
  time: string;
  location: string;
  onlineLink: string | null;
  description: string;
  maxCapacity: number | null;
  status: WorkshopStatusDisplay;
  statusLabel: string;
  statusVariant: 'default' | 'success' | 'warning' | 'error' | 'info';
  tallyFormId: string | null;
}

/** 工作坊統計顯示資料 */
export interface WorkshopStatsDisplay extends WorkshopDisplay {
  stats: {
    registered: number;
    ambassadors: number;
    lunchRequired: number;
    capacityRate: number | null;
  };
}

/** 工作坊類型對應表 */
const WORKSHOP_TYPE_CONFIG: Record<string, { label: string; icon: WorkshopDisplay['typeIcon'] }> = {
  online: { label: '線上', icon: 'video' },
  offline: { label: '實體', icon: 'location' },
  hybrid: { label: '混合', icon: 'hybrid' },
};

/** 工作坊狀態對應表 */
const WORKSHOP_STATUS_CONFIG: Record<string, { label: string; variant: WorkshopStatsDisplay['statusVariant'] }> = {
  upcoming: { label: '即將舉行', variant: 'info' },
  ongoing: { label: '進行中', variant: 'warning' },
  completed: { label: '已結束', variant: 'success' },
  cancelled: { label: '已取消', variant: 'error' },
};

/**
 * 格式化工作坊日期
 */
export function formatWorkshopDate(date: string): string {
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
 * 格式化工作坊時間
 */
export function formatWorkshopTime(startTime: string, endTime: string): string {
  const start = startTime.slice(0, 5);
  const end = endTime.slice(0, 5);
  return `${start} - ${end}`;
}

/**
 * 取得工作坊類型配置
 */
export function getWorkshopTypeConfig(type: string) {
  return WORKSHOP_TYPE_CONFIG[type] || { label: type, icon: 'location' as const };
}

/**
 * 取得工作坊狀態配置
 */
export function getWorkshopStatusConfig(status: string) {
  return WORKSHOP_STATUS_CONFIG[status] || { label: status, variant: 'default' as const };
}

/**
 * 取得工作坊地點顯示
 */
export function getWorkshopLocation(workshop: Workshop): string {
  if (workshop.type === 'online') {
    return '線上活動';
  }
  if (workshop.type === 'hybrid') {
    return workshop.location ? `${workshop.location} / 線上` : '混合模式';
  }
  return workshop.location || '待定';
}

/**
 * 轉換工作坊為顯示格式
 */
export function transformWorkshopForDisplay(workshop: Workshop): WorkshopDisplay {
  const typeConfig = getWorkshopTypeConfig(workshop.type);
  const statusConfig = getWorkshopStatusConfig(workshop.status);

  return {
    id: workshop.id,
    title: workshop.title,
    type: workshop.type,
    typeLabel: typeConfig.label,
    typeIcon: typeConfig.icon,
    date: workshop.date,
    dateFormatted: formatWorkshopDate(workshop.date),
    time: formatWorkshopTime(workshop.start_time, workshop.end_time),
    location: getWorkshopLocation(workshop),
    onlineLink: workshop.online_link,
    description: workshop.description || '',
    maxCapacity: workshop.max_capacity,
    status: workshop.status,
    statusLabel: statusConfig.label,
    statusVariant: statusConfig.variant,
    tallyFormId: workshop.tally_form_id,
  };
}

/**
 * 轉換工作坊含統計為顯示格式
 */
export function transformWorkshopWithStatsForDisplay(workshop: WorkshopWithStats): WorkshopStatsDisplay {
  const base = transformWorkshopForDisplay(workshop);
  const capacityRate = workshop.max_capacity
    ? Math.round((workshop.registrationCount / workshop.max_capacity) * 100)
    : null;

  return {
    ...base,
    stats: {
      registered: workshop.registrationCount,
      ambassadors: workshop.ambassadorCount,
      lunchRequired: workshop.lunchCount,
      capacityRate,
    },
  };
}

/**
 * 批量轉換工作坊列表
 */
export function transformWorkshopsForList(workshops: Workshop[]): WorkshopDisplay[] {
  return workshops.map(transformWorkshopForDisplay);
}

/**
 * 批量轉換工作坊含統計列表
 */
export function transformWorkshopsWithStatsForList(workshops: WorkshopWithStats[]): WorkshopStatsDisplay[] {
  return workshops.map(transformWorkshopWithStatsForDisplay);
}

/**
 * 過濾即將舉行的工作坊
 */
export function filterUpcomingWorkshops(workshops: WorkshopDisplay[]): WorkshopDisplay[] {
  return workshops.filter(w => w.status === 'upcoming');
}

/**
 * 根據日期排序工作坊
 */
export function sortWorkshopsByDate(workshops: WorkshopDisplay[], ascending = true): WorkshopDisplay[] {
  return [...workshops].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * 檢查工作坊是否已滿
 */
export function isWorkshopFull(workshop: WorkshopStatsDisplay): boolean {
  if (!workshop.maxCapacity) return false;
  return workshop.stats.registered >= workshop.maxCapacity;
}

/**
 * 取得剩餘名額
 */
export function getRemainingSlots(workshop: WorkshopStatsDisplay): number | null {
  if (!workshop.maxCapacity) return null;
  return Math.max(0, workshop.maxCapacity - workshop.stats.registered);
}

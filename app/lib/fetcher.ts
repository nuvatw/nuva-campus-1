/**
 * 統一資料獲取工具
 *
 * 支援 Server/Client 兩端的資料獲取
 * 整合快取和錯誤處理
 */

import { cache } from 'react';
import { supabase } from './supabase';
import { getCacheManager, CACHE_STRATEGIES } from './cache';

/** 獲取選項 */
interface FetchOptions {
  /** 快取策略 */
  cacheStrategy?: keyof typeof CACHE_STRATEGIES;
  /** 是否跳過快取 */
  skipCache?: boolean;
  /** 重新驗證時間（秒） */
  revalidate?: number;
}

/**
 * Server-side 資料獲取（使用 React cache）
 *
 * 自動在同一個請求中 dedupe
 */
export const fetchEvents = cache(async (options?: { type?: string; status?: string }) => {
  let query = supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (options?.type) query = query.eq('type', options.type);
  if (options?.status) query = query.eq('status', options.status);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
});

export const fetchEventById = cache(async (id: string) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
});

export const fetchEventWithStats = cache(async (id: string) => {
  const [eventResult, statsResult] = await Promise.all([
    supabase.from('events').select('*').eq('id', id).single(),
    supabase
      .from('event_registrations')
      .select('attended, lunch_box_required, lunch_collected')
      .eq('event_id', id),
  ]);

  if (eventResult.error) throw eventResult.error;

  const regs = statsResult.data || [];
  return {
    ...eventResult.data,
    registrationCount: regs.length,
    checkedInCount: regs.filter(r => r.attended).length,
    lunchRequiredCount: regs.filter(r => r.lunch_box_required).length,
    lunchCollectedCount: regs.filter(r => r.lunch_collected).length,
  };
});

export const fetchEventsWithStats = cache(async (options?: { type?: string }) => {
  const events = await fetchEvents(options);
  if (events.length === 0) return [];

  const eventIds = events.map(e => e.id);
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('event_id, attended, lunch_box_required, lunch_collected')
    .in('event_id', eventIds);

  const regMap = new Map<string, typeof registrations>();
  for (const reg of registrations || []) {
    const existing = regMap.get(reg.event_id) || [];
    existing.push(reg);
    regMap.set(reg.event_id, existing);
  }

  return events.map(event => {
    const eventRegs = regMap.get(event.id) || [];
    return {
      ...event,
      registrationCount: eventRegs.length,
      checkedInCount: eventRegs.filter(r => r.attended).length,
      lunchRequiredCount: eventRegs.filter(r => r.lunch_box_required).length,
      lunchCollectedCount: eventRegs.filter(r => r.lunch_collected).length,
    };
  });
});

export const fetchWorkshops = cache(async () => {
  const { data, error } = await supabase
    .from('workshops')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
});

export const fetchWorkshopById = cache(async (id: string) => {
  const { data, error } = await supabase
    .from('workshops')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
});

export const fetchWorkshopsWithStats = cache(async () => {
  const workshops = await fetchWorkshops();
  if (workshops.length === 0) return [];

  const workshopIds = workshops.map(w => w.id);
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('event_id, member_type, lunch_box_required')
    .in('event_id', workshopIds);

  const regMap = new Map<string, typeof registrations>();
  for (const reg of registrations || []) {
    const existing = regMap.get(reg.event_id) || [];
    existing.push(reg);
    regMap.set(reg.event_id, existing);
  }

  return workshops.map(workshop => {
    const workshopRegs = regMap.get(workshop.id) || [];
    return {
      ...workshop,
      registrationCount: workshopRegs.length,
      ambassadorCount: workshopRegs.filter(r => r.member_type === 'ambassador').length,
      lunchCount: workshopRegs.filter(r => r.lunch_box_required).length,
    };
  });
});

export const fetchRegistrationsByEvent = cache(async (eventId: string) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('registered_at', { ascending: true });

  if (error) throw error;
  return data || [];
});

export const fetchDashboardStats = cache(async () => {
  const today = new Date().toISOString().split('T')[0];

  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('attended, attended_at, lunch_box_required, lunch_collected, notification_sent');

  const regs = registrations || [];

  return {
    totalRegistrations: regs.length,
    todayCheckins: regs.filter(r => r.attended && r.attended_at?.startsWith(today)).length,
    lunchCollected: regs.filter(r => r.lunch_collected).length,
    lunchRequired: regs.filter(r => r.lunch_box_required).length,
    pendingNotifications: regs.filter(r => !r.notification_sent).length,
  };
});

/**
 * Client-side 資料獲取（使用 cache manager）
 *
 * 用於需要即時更新的場景
 */
export async function clientFetchEvents(options?: { type?: string; status?: string }) {
  const cache = getCacheManager();
  const cacheKey = `events:${options?.type || 'all'}:${options?.status || 'all'}`;

  return cache.get(
    cacheKey,
    () => fetchEvents(options),
    CACHE_STRATEGIES.events
  );
}

export async function clientFetchEventWithStats(id: string) {
  const cache = getCacheManager();
  return cache.get(
    `event:stats:${id}`,
    () => fetchEventWithStats(id),
    CACHE_STRATEGIES.eventStats
  );
}

export async function clientFetchWorkshops() {
  const cache = getCacheManager();
  return cache.get(
    'workshops:list',
    fetchWorkshops,
    CACHE_STRATEGIES.workshops
  );
}

/**
 * SWR fetcher
 */
export const swrFetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

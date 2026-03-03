import { supabase } from '@/app/lib/supabase';
import {
  getCacheManager,
  CACHE_STRATEGIES,
  CACHE_KEY_PREFIX,
  generateCacheKey,
  invalidateEventCache,
} from '@/app/lib/cache';

export interface Event {
  id: string;
  type: 'workshop' | 'mission' | 'nunu_activity' | 'other';
  title: string;
  description: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  online_link: string | null;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  metadata: Record<string, unknown>;
  password: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventWithStats extends Event {
  registrationCount: number;
  checkedInCount: number;
  lunchRequiredCount: number;
  lunchCollectedCount: number;
}

const cache = getCacheManager();

export const eventsService = {
  /**
   * 取得所有活動（帶快取）
   */
  async getAll(options?: { type?: string; status?: string }): Promise<Event[]> {
    const cacheKey = generateCacheKey(
      CACHE_KEY_PREFIX.EVENT_LIST,
      options?.type || 'all',
      options?.status || 'all'
    );

    return cache.get(
      cacheKey,
      async () => {
        let query = supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });

        if (options?.type) {
          query = query.eq('type', options.type);
        }

        if (options?.status) {
          query = query.eq('status', options.status);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching events:', error);
          return [];
        }

        return data || [];
      },
      CACHE_STRATEGIES.events
    );
  },

  /**
   * 取得單一活動（帶快取）
   */
  async getById(id: string): Promise<Event | null> {
    const cacheKey = generateCacheKey(CACHE_KEY_PREFIX.EVENT, id);

    return cache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching event:', error);
          return null;
        }

        return data;
      },
      CACHE_STRATEGIES.events
    );
  },

  /**
   * 取得活動及其統計資料（帶快取）
   * 使用單一查詢避免 N+1 問題
   */
  async getWithStats(id: string): Promise<EventWithStats | null> {
    const cacheKey = generateCacheKey(CACHE_KEY_PREFIX.EVENT_STATS, id);

    return cache.get(
      cacheKey,
      async () => {
        // 同時查詢活動和報名統計
        const [eventResult, statsResult] = await Promise.all([
          supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single(),
          supabase
            .from('event_registrations')
            .select('attended, lunch_box_required, lunch_collected')
            .eq('event_id', id),
        ]);

        if (eventResult.error || !eventResult.data) {
          console.error('Error fetching event:', eventResult.error);
          return null;
        }

        const regs = statsResult.data || [];
        const stats = {
          registrationCount: regs.length,
          checkedInCount: regs.filter(r => r.attended).length,
          lunchRequiredCount: regs.filter(r => r.lunch_box_required).length,
          lunchCollectedCount: regs.filter(r => r.lunch_collected).length,
        };

        return { ...eventResult.data, ...stats };
      },
      CACHE_STRATEGIES.eventStats
    );
  },

  /**
   * 取得所有活動及其統計（帶快取）
   * 優化：使用批量查詢避免 N+1
   */
  async getAllWithStats(options?: { type?: string }): Promise<EventWithStats[]> {
    const cacheKey = generateCacheKey(
      CACHE_KEY_PREFIX.EVENT_LIST,
      'stats',
      options?.type || 'all'
    );

    return cache.get(
      cacheKey,
      async () => {
        // 先取得所有活動
        const events = await this.getAll(options);
        if (events.length === 0) return [];

        // 批量查詢所有報名（單一查詢）
        const eventIds = events.map(e => e.id);
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('event_id, attended, lunch_box_required, lunch_collected')
          .in('event_id', eventIds);

        // 建立報名 Map 以 O(1) 查詢
        const regMap = new Map<string, typeof registrations>();
        for (const reg of registrations || []) {
          const existing = regMap.get(reg.event_id) || [];
          existing.push(reg);
          regMap.set(reg.event_id, existing);
        }

        // 組合結果
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
      },
      CACHE_STRATEGIES.eventStats
    );
  },

  /**
   * 取得 Dashboard 統計摘要（帶快取）
   */
  async getDashboardStats(): Promise<{
    totalRegistrations: number;
    todayCheckins: number;
    lunchCollected: number;
    lunchRequired: number;
    pendingNotifications: number;
  }> {
    const cacheKey = generateCacheKey(CACHE_KEY_PREFIX.DASHBOARD, 'stats');

    return cache.get(
      cacheKey,
      async () => {
        const today = new Date().toISOString().split('T')[0];

        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('attended, attended_at, lunch_box_required, lunch_collected, notification_sent');

        const regs = registrations || [];

        return {
          totalRegistrations: regs.length,
          todayCheckins: regs.filter(r =>
            r.attended && r.attended_at?.startsWith(today)
          ).length,
          lunchCollected: regs.filter(r => r.lunch_collected).length,
          lunchRequired: regs.filter(r => r.lunch_box_required).length,
          pendingNotifications: regs.filter(r => !r.notification_sent).length,
        };
      },
      CACHE_STRATEGIES.dashboardStats
    );
  },

  /**
   * 建立活動
   */
  async create(event: Omit<Event, 'created_at' | 'updated_at'>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }

    // 失效相關快取
    invalidateEventCache();

    return data;
  },

  /**
   * 更新活動
   */
  async update(id: string, updates: Partial<Event>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return null;
    }

    // 失效相關快取
    invalidateEventCache(id);

    return data;
  },
};

import { supabase } from '@/app/lib/supabase';
import {
  getCacheManager,
  CACHE_STRATEGIES,
  CACHE_KEY_PREFIX,
  generateCacheKey,
  invalidateWorkshopCache,
} from '@/app/lib/cache';

export interface Workshop {
  id: string;
  title: string;
  type: 'online' | 'offline' | 'hybrid';
  date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  online_link: string | null;
  description: string | null;
  max_capacity: number | null;
  tally_form_id: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface WorkshopWithStats extends Workshop {
  registrationCount: number;
  ambassadorCount: number;
  lunchCount: number;
}

const cache = getCacheManager();

export const workshopsService = {
  /**
   * 取得所有工作坊（帶快取）
   */
  async getAll(): Promise<Workshop[]> {
    const cacheKey = CACHE_KEY_PREFIX.WORKSHOP_LIST;

    return cache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('workshops')
          .select('*')
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching workshops:', error);
          return [];
        }

        return data || [];
      },
      CACHE_STRATEGIES.workshops
    );
  },

  /**
   * 取得單一工作坊（帶快取）
   */
  async getById(id: string): Promise<Workshop | null> {
    const cacheKey = generateCacheKey(CACHE_KEY_PREFIX.WORKSHOP, id);

    return cache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('workshops')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching workshop:', error);
          return null;
        }

        return data;
      },
      CACHE_STRATEGIES.workshops
    );
  },

  /**
   * 取得工作坊及其統計資料（帶快取）
   * 使用 Promise.all 避免 N+1
   */
  async getWithStats(id: string): Promise<WorkshopWithStats | null> {
    const cacheKey = generateCacheKey(CACHE_KEY_PREFIX.WORKSHOP_STATS, id);

    return cache.get(
      cacheKey,
      async () => {
        // 同時查詢工作坊和報名統計
        const [workshopResult, registrationsResult] = await Promise.all([
          supabase
            .from('workshops')
            .select('*')
            .eq('id', id)
            .single(),
          supabase
            .from('event_registrations')
            .select('member_type, ambassador_id, lunch_box_required')
            .eq('event_id', id),
        ]);

        if (workshopResult.error || !workshopResult.data) {
          console.error('Error fetching workshop:', workshopResult.error);
          return null;
        }

        const registrations = registrationsResult.data || [];
        const stats = {
          registrationCount: registrations.length,
          ambassadorCount: registrations.filter(r => r.member_type === 'ambassador').length,
          lunchCount: registrations.filter(r => r.lunch_box_required).length,
        };

        return { ...workshopResult.data, ...stats };
      },
      CACHE_STRATEGIES.workshops
    );
  },

  /**
   * 取得所有工作坊及其統計（帶快取）
   * 優化：批量查詢避免 N+1
   */
  async getAllWithStats(): Promise<WorkshopWithStats[]> {
    const cacheKey = generateCacheKey(CACHE_KEY_PREFIX.WORKSHOP_LIST, 'stats');

    return cache.get(
      cacheKey,
      async () => {
        const workshops = await this.getAll();
        if (workshops.length === 0) return [];

        // 批量查詢所有報名
        const workshopIds = workshops.map(w => w.id);
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('event_id, member_type, ambassador_id, lunch_box_required')
          .in('event_id', workshopIds);

        // 建立報名 Map
        const regMap = new Map<string, typeof registrations>();
        for (const reg of registrations || []) {
          const existing = regMap.get(reg.event_id) || [];
          existing.push(reg);
          regMap.set(reg.event_id, existing);
        }

        // 組合結果
        return workshops.map(workshop => {
          const workshopRegs = regMap.get(workshop.id) || [];
          return {
            ...workshop,
            registrationCount: workshopRegs.length,
            ambassadorCount: workshopRegs.filter(r => r.member_type === 'ambassador').length,
            lunchCount: workshopRegs.filter(r => r.lunch_box_required).length,
          };
        });
      },
      CACHE_STRATEGIES.workshops
    );
  },

  /**
   * 建立工作坊
   */
  async create(workshop: Omit<Workshop, 'created_at' | 'updated_at'>): Promise<Workshop | null> {
    const { data, error } = await supabase
      .from('workshops')
      .insert(workshop)
      .select()
      .single();

    if (error) {
      console.error('Error creating workshop:', error);
      return null;
    }

    // 失效快取
    invalidateWorkshopCache();

    return data;
  },

  /**
   * 更新工作坊
   */
  async update(id: string, updates: Partial<Workshop>): Promise<Workshop | null> {
    const { data, error } = await supabase
      .from('workshops')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating workshop:', error);
      return null;
    }

    // 失效快取
    invalidateWorkshopCache(id);

    return data;
  },

  /**
   * 刪除工作坊
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting workshop:', error);
      return false;
    }

    // 失效快取
    invalidateWorkshopCache(id);

    return true;
  },
};

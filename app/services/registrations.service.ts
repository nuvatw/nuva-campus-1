import { supabase } from '@/app/lib/supabase';
import {
  getCacheManager,
  CACHE_STRATEGIES,
  CACHE_KEY_PREFIX,
  generateCacheKey,
  invalidateRegistrationCache,
} from '@/app/lib/cache';

export interface Registration {
  id: string;
  event_id: string;
  member_type: string;
  ambassador_id: string | null;
  participant_name: string;
  participant_email: string;
  attendance_mode: 'online' | 'offline';
  lunch_box_required: boolean;
  attended: boolean;
  attended_at: string | null;
  checkin_code: string | null;
  lunch_code: string | null;
  lunch_collected: boolean;
  lunch_collected_at: string | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  registered_at: string;
  created_at: string;
  updated_at: string;
}

const cache = getCacheManager();

export const registrationsService = {
  /**
   * 取得活動的所有報名（帶快取）
   */
  async getByEvent(eventId: string): Promise<Registration[]> {
    const cacheKey = generateCacheKey(CACHE_KEY_PREFIX.REGISTRATION_LIST, eventId);

    return cache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('event_id', eventId)
          .order('registered_at', { ascending: true });

        if (error) {
          console.error('Error fetching registrations:', error);
          return [];
        }

        return data || [];
      },
      CACHE_STRATEGIES.registrations
    );
  },

  /**
   * 取得單一報名（帶快取）
   */
  async getById(id: string): Promise<Registration | null> {
    const cacheKey = generateCacheKey(CACHE_KEY_PREFIX.REGISTRATION, id);

    return cache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching registration:', error);
          return null;
        }

        return data;
      },
      CACHE_STRATEGIES.registrations
    );
  },

  /**
   * 依報到碼查詢（不快取，需即時）
   */
  async getByCheckinCode(eventId: string, code: string): Promise<Registration | null> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('checkin_code', code)
      .single();

    if (error) {
      return null;
    }

    return data;
  },

  /**
   * 依便當碼查詢（不快取，需即時）
   */
  async getByLunchCode(eventId: string, code: string): Promise<Registration | null> {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('lunch_code', code)
      .single();

    if (error) {
      return null;
    }

    return data;
  },

  /**
   * 更新報名資料
   */
  async update(id: string, updates: Partial<Registration>): Promise<Registration | null> {
    const { data, error } = await supabase
      .from('event_registrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating registration:', error);
      return null;
    }

    // 失效相關快取
    if (data) {
      invalidateRegistrationCache(data.event_id);
      cache.delete(generateCacheKey(CACHE_KEY_PREFIX.REGISTRATION, id));
    }

    return data;
  },

  /**
   * 報到
   */
  async checkin(id: string): Promise<Registration | null> {
    return this.update(id, {
      attended: true,
      attended_at: new Date().toISOString(),
    });
  },

  /**
   * 取消報到
   */
  async uncheckIn(id: string): Promise<Registration | null> {
    return this.update(id, {
      attended: false,
      attended_at: null,
    });
  },

  /**
   * 領取便當
   */
  async collectLunch(id: string): Promise<Registration | null> {
    return this.update(id, {
      lunch_collected: true,
      lunch_collected_at: new Date().toISOString(),
    });
  },

  /**
   * 取消便當領取
   */
  async uncollectLunch(id: string): Promise<Registration | null> {
    return this.update(id, {
      lunch_collected: false,
      lunch_collected_at: null,
    });
  },

  /**
   * 標記通知已發送
   */
  async markNotificationSent(id: string): Promise<Registration | null> {
    return this.update(id, {
      notification_sent: true,
      notification_sent_at: new Date().toISOString(),
    });
  },

  /**
   * 取得活動統計（帶快取）
   */
  async getEventStats(eventId: string): Promise<{
    total: number;
    checkedIn: number;
    lunchRequired: number;
    lunchCollected: number;
    notificationSent: number;
    notificationPending: number;
  }> {
    const cacheKey = generateCacheKey(CACHE_KEY_PREFIX.EVENT_STATS, 'registration', eventId);

    return cache.get(
      cacheKey,
      async () => {
        const { data } = await supabase
          .from('event_registrations')
          .select('attended, lunch_box_required, lunch_collected, notification_sent')
          .eq('event_id', eventId);

        const regs = data || [];

        return {
          total: regs.length,
          checkedIn: regs.filter(r => r.attended).length,
          lunchRequired: regs.filter(r => r.lunch_box_required).length,
          lunchCollected: regs.filter(r => r.lunch_collected).length,
          notificationSent: regs.filter(r => r.notification_sent).length,
          notificationPending: regs.filter(r => !r.notification_sent).length,
        };
      },
      CACHE_STRATEGIES.eventStats
    );
  },

  /**
   * 刪除報名
   */
  async delete(id: string): Promise<boolean> {
    // 先取得報名資料以獲取 event_id
    const registration = await this.getById(id);

    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting registration:', error);
      return false;
    }

    // 失效相關快取
    if (registration) {
      invalidateRegistrationCache(registration.event_id);
    }
    cache.delete(generateCacheKey(CACHE_KEY_PREFIX.REGISTRATION, id));

    return true;
  },
};

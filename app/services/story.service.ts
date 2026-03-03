import { supabase } from '@/app/lib/supabase';
import {
  getCacheManager,
  CACHE_STRATEGIES,
  CACHE_KEY_PREFIX,
  generateCacheKey,
} from '@/app/lib/cache';
import type { StoryLog, StoryTemplate, CreateStoryLogInput, CreateTemplateInput } from '@/app/types/story';

const cache = getCacheManager();

function invalidateStoryCache(): void {
  cache.invalidateByTag('story');
}

export const storyService = {
  /**
   * 取得所有故事紀錄（最新在上，帶快取）
   */
  async getLogs(limit?: number): Promise<StoryLog[]> {
    const cacheKey = generateCacheKey(CACHE_KEY_PREFIX.STORY_LIST, String(limit || 'all'));

    return cache.get(
      cacheKey,
      async () => {
        let query = supabase
          .from('story_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching story logs:', error);
          return [];
        }

        return data || [];
      },
      CACHE_STRATEGIES.storyLogs
    );
  },

  /**
   * 新增故事紀錄
   */
  async createLog(input: CreateStoryLogInput): Promise<StoryLog | null> {
    const { data, error } = await supabase
      .from('story_logs')
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error('Error creating story log:', error);
      return null;
    }

    invalidateStoryCache();
    return data;
  },

  /**
   * 刪除故事紀錄
   */
  async deleteLog(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('story_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting story log:', error);
      return false;
    }

    invalidateStoryCache();
    return true;
  },

  /**
   * 取得所有模板（帶快取）
   */
  async getTemplates(): Promise<StoryTemplate[]> {
    const cacheKey = generateCacheKey(CACHE_KEY_PREFIX.STORY_TEMPLATE_LIST);

    return cache.get(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('story_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching story templates:', error);
          return [];
        }

        return data || [];
      },
      CACHE_STRATEGIES.storyTemplates
    );
  },

  /**
   * 新增模板
   */
  async createTemplate(input: CreateTemplateInput): Promise<StoryTemplate | null> {
    const { data, error } = await supabase
      .from('story_templates')
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error('Error creating story template:', error);
      return null;
    }

    cache.invalidateByTag('story-templates');
    return data;
  },

  /**
   * 刪除模板
   */
  async deleteTemplate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('story_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting story template:', error);
      return false;
    }

    cache.invalidateByTag('story-templates');
    return true;
  },
};

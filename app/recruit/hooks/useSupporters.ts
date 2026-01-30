'use client';

import useSWR from 'swr';
import { supabase } from '@/app/lib/supabase';
import type { Supporter, SupportStats } from '../types';

// 取得支持者列表（全部）
async function fetchSupporters(): Promise<Supporter[]> {
  const { data } = await supabase
    .from('campus_supporters')
    .select('id, supporter_name, university_name, support_type, message, created_at')
    .order('created_at', { ascending: false });
  return data || [];
}

// 取得統計資料
async function fetchSupportStats(): Promise<SupportStats[]> {
  const { data } = await supabase
    .from('university_support_stats')
    .select('*')
    .order('total_supporters', { ascending: false });
  return data || [];
}

export function useSupporters() {
  const { data: supporters, isLoading, error, mutate } = useSWR(
    'supporters',
    fetchSupporters,
    { refreshInterval: 10000 }
  );

  return {
    supporters: supporters || [],
    isLoading,
    error,
    mutate,
  };
}

export function useSupportStats() {
  const { data: stats, isLoading, error, mutate } = useSWR(
    'support-stats',
    fetchSupportStats,
    { refreshInterval: 30000 }
  );

  return {
    stats: stats || [],
    isLoading,
    error,
    mutate,
  };
}

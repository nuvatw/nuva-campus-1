'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase';

export interface Mission {
  id: string;
  name: string;
  status: string;
  description: string;
  due_date: string | null;
}

const TOTAL_MISSIONS = 21;

/**
 * useMissions hook
 *
 * Manages mission data fetching from Supabase with real-time subscription.
 * Builds a fixed 21-slot array where existing missions overlay locked placeholders.
 */
export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMissions = useCallback(async () => {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching missions:', error);
    } else if (data) {
      setMissions(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMissions();

    const channel = supabase
      .channel('missions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        fetchMissions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMissions]);

  // Build 21 mission slots, overlaying Supabase data
  const allMissions = Array.from({ length: TOTAL_MISSIONS }, (_, i) => {
    const missionId = `m${String(i + 1).padStart(2, '0')}`;
    const existing = missions.find((m) => m.id === missionId);
    return existing || { id: missionId, name: '', status: 'locked', description: '', due_date: null };
  });

  const ongoingMission = missions.find((m) => m.status === 'ongoing') || null;
  const completedCount = allMissions.filter((m) => m.status === 'done').length;

  return {
    missions: allMissions,
    ongoingMission,
    completedCount,
    totalMissions: TOTAL_MISSIONS,
    isLoading,
  };
}

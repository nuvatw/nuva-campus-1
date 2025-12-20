'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import MissionItem from './MissionItem';

interface Mission {
  id: string;
  name: string;
  status: string;
  description: string;
  due_date: string | null;
}

export default function MissionGrid() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    async function fetchMissions() {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching missions:', error);
      }
      
      // 補齊到 21 個任務
      const allMissions: Mission[] = [];
      for (let i = 1; i <= 21; i++) {
        const missionId = `m${i.toString().padStart(2, '0')}`;
        const existing = data?.find((m) => m.id === missionId);
        if (existing) {
          allMissions.push(existing);
        } else {
          allMissions.push({
            id: missionId,
            name: `任務 ${i}`,
            status: 'locked',
            description: '',
            due_date: null,
          });
        }
      }
      setMissions(allMissions);
      setLoading(false);
    }

    fetchMissions();

    // 即時訂閱更新
    const channel = supabase
      .channel('missions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'missions' },
        () => {
          fetchMissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 找到當前進行中的任務
  const ongoingMission = missions.find((m) => m.status === 'ongoing');
  
  // 倒數計時
  useEffect(() => {
    if (!ongoingMission?.due_date) return;

    const updateCountdown = () => {
      const now = new Date();
      const dueDate = new Date(ongoingMission.due_date + 'T23:59:59');
      const diff = dueDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('已截止');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days} 天 ${hours} 小時 ${minutes} 分 ${seconds} 秒`);
      } else if (hours > 0) {
        setCountdown(`${hours} 小時 ${minutes} 分 ${seconds} 秒`);
      } else {
        setCountdown(`${minutes} 分 ${seconds} 秒`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [ongoingMission]);

  // 轉換狀態 - done 轉成 completed
  const getMissionStatus = (status: string): 'completed' | 'ongoing' | 'locked' => {
    if (status === 'done' || status === 'completed') {
      return 'completed';
    }
    if (status === 'ongoing') {
      return 'ongoing';
    }
    return 'locked';
  };

  const completedCount = missions.filter((m) => m.status === 'done' || m.status === 'completed').length;
  const totalCount = missions.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <section className="bg-gray-50 py-20 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-pulse text-gray-400">載入中...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-20 px-8">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center relative pb-4">
          📋 每週任務
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded" />
        </h2>

        {/* 倒數計時 */}
        {ongoingMission && ongoingMission.due_date && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-primary/20 text-center">
              <div className="text-sm text-gray-500 mb-2">⏰ 繳交倒數</div>
              <div className="text-3xl font-bold text-primary">
                {countdown}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                截止日期：{new Date(ongoingMission.due_date).toLocaleDateString('zh-TW', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        )}

        {/* 進度條 */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>任務進度</span>
            <span className="font-medium">{completedCount} / {totalCount} 完成</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-success h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* 任務網格 */}
        <div className="grid grid-cols-7 gap-6 max-w-2xl mx-auto mb-12">
          {missions.map((mission) => (
            <MissionItem
              key={mission.id}
              mission={{
                id: mission.id,
                name: mission.name,
                status: getMissionStatus(mission.status),
                description: mission.description || '',
              }}
            />
          ))}
        </div>

        {/* 圖例 */}
        <div className="flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-success-light border-2 border-success rounded-lg relative">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full flex items-center justify-center text-white text-[8px]">✓</div>
            </div>
            <span className="text-gray-600">已完成</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-50 border-2 border-primary rounded-lg relative">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center text-white text-[8px]">→</div>
            </div>
            <span className="text-gray-600">進行中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-50 border-2 border-gray-200 rounded-lg relative opacity-60">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-300 rounded-full flex items-center justify-center text-[6px]">🔒</div>
            </div>
            <span className="text-gray-600">尚未開放</span>
          </div>
        </div>
      </div>
    </section>
  );
}
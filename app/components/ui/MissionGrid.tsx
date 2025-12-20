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
  const [countdown, setCountdown] = useState<string>('');
  const [ongoingMission, setOngoingMission] = useState<Mission | null>(null);

  useEffect(() => {
    async function fetchMissions() {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching missions:', error);
      } else if (data) {
        setMissions(data);
        const ongoing = data.find((m) => m.status === 'ongoing');
        if (ongoing) {
          setOngoingMission(ongoing);
        }
      }
    }

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
  }, []);

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

      setCountdown(`${days} 天 ${hours} 小時 ${minutes} 分 ${seconds} 秒`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [ongoingMission]);

  const allMissions = Array.from({ length: 21 }, (_, i) => {
    const missionId = `m${String(i + 1).padStart(2, '0')}`;
    const existingMission = missions.find((m) => m.id === missionId);
    return existingMission || { id: missionId, name: '', status: 'locked', description: '', due_date: null };
  });

  const completedCount = allMissions.filter((m) => m.status === 'done').length;

  const getStatus = (status: string): 'completed' | 'ongoing' | 'locked' => {
    if (status === 'done') return 'completed';
    if (status === 'ongoing') return 'ongoing';
    return 'locked';
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center relative pb-4">
          📋 每週任務
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded" />
        </h2>

        {/* 倒數計時 */}
        {ongoingMission && ongoingMission.due_date && (
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-primary/20 text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">⏰ 繳交倒數</div>
            <div className="text-2xl sm:text-3xl font-bold text-primary">{countdown}</div>
            <div className="text-xs text-gray-400 mt-2">
              截止日期：{new Date(ongoingMission.due_date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        )}

        {/* 進度條 */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>任務進度</span>
            <span className="font-medium">{completedCount} / 21 完成</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-success h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 21) * 100}%` }}
            />
          </div>
        </div>

        {/* 任務網格 - 手機 5 欄，平板 7 欄 */}
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 sm:gap-3 justify-items-center">
          {allMissions.map((mission) => (
            <MissionItem
              key={mission.id}
              id={mission.id}
              status={getStatus(mission.status)}
            />
          ))}
        </div>

        {/* 圖例 */}
        <div className="flex justify-center gap-4 sm:gap-8 mt-8 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-success-light border-2 border-success rounded" />
            <span>已完成</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-50 border-2 border-primary rounded" />
            <span>進行中</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-50 border-2 border-gray-200 rounded" />
            <span>尚未開放</span>
          </div>
        </div>
      </div>
    </section>
  );
}
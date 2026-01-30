'use client';

import { useEffect, useState, memo, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase';
import MissionItem from './MissionItem';
import { Countdown } from './Countdown';

interface Mission {
  id: string;
  name: string;
  status: string;
  description: string;
  due_date: string | null;
}

/**
 * 倒數計時區塊組件
 * 獨立出來避免整個 Grid 每秒重新渲染
 */
const CountdownSection = memo(function CountdownSection({
  dueDate,
}: {
  dueDate: string;
}) {
  // 將 due_date 轉換為當天 23:59:59
  const targetDate = new Date(dueDate + 'T23:59:59');

  return (
    <div className="bg-bg-card rounded-xl p-6 shadow-sm border-2 border-primary/20 text-center mb-8">
      <div className="text-sm text-text-secondary mb-2 flex items-center justify-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        繳交倒數
      </div>
      <div
        className="text-2xl sm:text-3xl font-bold text-primary"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">距離截止還有</span>
        <Countdown
          targetDate={targetDate}
          completedText="已截止"
        />
      </div>
      <div className="text-xs text-text-muted mt-2">
        截止日期：{new Date(dueDate).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
});

/**
 * 進度條組件
 */
const ProgressBar = memo(function ProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const percentage = (completed / total) * 100;

  return (
    <div className="mb-8" role="group" aria-label="任務進度">
      <div className="flex justify-between text-sm text-text-secondary mb-2">
        <span>任務進度</span>
        <span className="font-medium" aria-live="polite">{completed} / {total} 完成</span>
      </div>
      <div className="w-full bg-bg-secondary rounded-full h-3" role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={total}>
        <div
          className="bg-success h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

/**
 * 任務項目包裝組件
 * 使用 memo 避免不必要的重新渲染
 */
const MissionItemWrapper = memo(function MissionItemWrapper({
  mission,
  statusLabel,
}: {
  mission: Mission;
  statusLabel: string;
}) {
  const getStatus = (status: string): 'completed' | 'ongoing' | 'locked' => {
    if (status === 'done') return 'completed';
    if (status === 'ongoing') return 'ongoing';
    return 'locked';
  };

  return (
    <div role="listitem">
      <MissionItem
        id={mission.id}
        status={getStatus(mission.status)}
        aria-label={`任務 ${mission.id.toUpperCase()}，${statusLabel}`}
      />
    </div>
  );
});

/**
 * 狀態說明組件
 */
const Legend = memo(function Legend() {
  return (
    <div
      className="flex justify-center gap-4 sm:gap-8 mt-8 text-xs sm:text-sm text-text-secondary"
      role="legend"
      aria-label="任務狀態說明"
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className="w-4 h-4 sm:w-5 sm:h-5 bg-success-light border-2 border-success rounded flex items-center justify-center"
          aria-hidden="true"
        >
          <svg className="w-2.5 h-2.5 text-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
        <span>已完成</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className="w-4 h-4 sm:w-5 sm:h-5 bg-primary/10 border-2 border-primary rounded flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
        </span>
        <span>進行中</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className="w-4 h-4 sm:w-5 sm:h-5 bg-bg-secondary border-2 border-border rounded flex items-center justify-center"
          aria-hidden="true"
        >
          <svg className="w-2.5 h-2.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </span>
        <span>尚未開放</span>
      </div>
    </div>
  );
});

/**
 * Loading Skeleton
 */
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 sm:gap-3 justify-items-center">
      {[...Array(21)].map((_, i) => (
        <div
          key={i}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-bg-secondary animate-pulse"
        />
      ))}
    </div>
  );
});

/**
 * MissionGrid 組件
 *
 * 優化重點：
 * 1. 倒數計時獨立成 CountdownSection，不會觸發整個 Grid 重新渲染
 * 2. 每個 MissionItem 使用 memo 包裝
 * 3. 進度條和說明也使用 memo
 */
function MissionGridComponent() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [ongoingMission, setOngoingMission] = useState<Mission | null>(null);
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
      const ongoing = data.find((m) => m.status === 'ongoing');
      setOngoingMission(ongoing || null);
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

  // 建立 21 個任務，用 Supabase 資料覆蓋
  const allMissions = Array.from({ length: 21 }, (_, i) => {
    const missionId = `m${String(i + 1).padStart(2, '0')}`;
    const existingMission = missions.find((m) => m.id === missionId);
    return existingMission || { id: missionId, name: '', status: 'locked', description: '', due_date: null };
  });

  const completedCount = allMissions.filter((m) => m.status === 'done').length;

  const getStatusLabel = (status: string): string => {
    if (status === 'done') return '已完成';
    if (status === 'ongoing') return '進行中';
    return '尚未開放';
  };

  return (
    <section className="bg-bg-card py-16 px-4 sm:px-8" aria-labelledby="mission-title">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <h2
          id="mission-title"
          className="text-2xl sm:text-3xl font-bold text-text-primary mb-8 text-center relative pb-4"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            每週任務
          </span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded" aria-hidden="true" />
        </h2>

        {/* Countdown Timer - 獨立組件，不會觸發 Grid 重新渲染 */}
        {ongoingMission?.due_date && (
          <CountdownSection dueDate={ongoingMission.due_date} />
        )}

        {/* Progress Bar */}
        <ProgressBar completed={completedCount} total={21} />

        {/* Mission Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div
            className="grid grid-cols-5 sm:grid-cols-7 gap-2 sm:gap-3 justify-items-center"
            role="list"
            aria-label="任務列表"
          >
            {allMissions.map((mission) => (
              <MissionItemWrapper
                key={mission.id}
                mission={mission}
                statusLabel={getStatusLabel(mission.status)}
              />
            ))}
          </div>
        )}

        {/* Legend */}
        <Legend />
      </div>
    </section>
  );
}

// 使用 memo 導出主組件
const MissionGrid = memo(MissionGridComponent);

export default MissionGrid;

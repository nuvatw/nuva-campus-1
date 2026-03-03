'use client';

import { memo } from 'react';
import { useMissions } from '@/app/hooks/useMissions';
import { FadeIn, StaggerChildren } from '@/app/components/motion';
import MissionItem from './MissionItem';
import MissionCountdown from './MissionCountdown';
import MissionProgress from './MissionProgress';

const statusMap: Record<string, 'completed' | 'ongoing' | 'locked'> = {
  done: 'completed',
  ongoing: 'ongoing',
};

const statusLabelMap: Record<string, string> = {
  done: '已完成',
  ongoing: '進行中',
};

function MissionGridComponent() {
  const { missions, ongoingMission, completedCount, totalMissions, isLoading } = useMissions();

  return (
    <section className="bg-bg-card py-16 px-4 sm:px-8" aria-labelledby="mission-title">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
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
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary to-accent rounded" aria-hidden="true" />
          </h2>
        </FadeIn>

        {ongoingMission?.due_date && (
          <MissionCountdown dueDate={ongoingMission.due_date} />
        )}

        <MissionProgress completed={completedCount} total={totalMissions} />

        {isLoading ? (
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 sm:gap-3 justify-items-center">
            {[...Array(21)].map((_, i) => (
              <div key={i} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-neutral-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <StaggerChildren
            className="grid grid-cols-5 sm:grid-cols-7 gap-2 sm:gap-3 justify-items-center"
            role="list"
            aria-label="任務列表"
          >
            {missions.map((mission) => (
              <StaggerChildren.Item key={mission.id} role="listitem">
                <MissionItem
                  id={mission.id}
                  status={statusMap[mission.status] || 'locked'}
                  aria-label={`任務 ${mission.id.toUpperCase()}，${statusLabelMap[mission.status] || '尚未開放'}`}
                />
              </StaggerChildren.Item>
            ))}
          </StaggerChildren>
        )}

        {/* Legend */}
        <div className="flex justify-center gap-4 sm:gap-8 mt-8 text-xs sm:text-sm text-text-secondary" role="legend" aria-label="任務狀態說明">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-success/20 to-success/5 border-2 border-success rounded flex items-center justify-center" aria-hidden="true">
              <svg className="w-2.5 h-2.5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span>已完成</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-primary/15 to-accent/10 border-2 border-primary rounded flex items-center justify-center" aria-hidden="true">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            </span>
            <span>進行中</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-4 h-4 sm:w-5 sm:h-5 bg-bg-secondary border-2 border-border rounded flex items-center justify-center" aria-hidden="true">
              <svg className="w-2.5 h-2.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <span>尚未開放</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const MissionGrid = memo(MissionGridComponent);
export default MissionGrid;
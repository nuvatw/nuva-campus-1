'use client';

import { useState, useEffect } from 'react';
import { storyService } from '@/app/services/story.service';
import type { StoryLog } from '@/app/types/story';
import { StaggerChildren } from '@/app/components/motion';

const MAX_DISPLAY = 10;

function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${parseInt(month)}月${parseInt(day)}日`;
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

export default function StoryProgressSection() {
  const [logs, setLogs] = useState<StoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await storyService.getLogs(MAX_DISPLAY);
        setLogs(data);
      } catch {
        // Silent fail — section just won't show data
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (isLoading) {
    return (
      <div className="py-6 px-5">
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-bg-secondary" />
                <div className="w-0.5 h-16 bg-bg-secondary mt-1" />
              </div>
              <div className="flex-1 pb-6">
                <div className="h-3 bg-bg-secondary rounded w-24 mb-2" />
                <div className="h-4 bg-bg-secondary rounded w-full mb-1" />
                <div className="h-4 bg-bg-secondary rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-10 px-5 text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <p className="text-sm text-text-muted">故事正在醞釀中...</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-5">
      <StaggerChildren staggerDelay={0.06} initialDelay={0.05} className="relative">
        {logs.map((log, index) => {
          const isLast = index === logs.length - 1;
          const isFirst = index === 0;

          return (
            <StaggerChildren.Item key={log.id}>
              <div className="flex gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`relative w-3 h-3 rounded-full shrink-0 transition-colors duration-300 ${
                    isFirst
                      ? 'bg-primary ring-[3px] ring-primary/20'
                      : 'bg-neutral-300 ring-2 ring-neutral-200/50'
                  }`}>
                    {isFirst && (
                      <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    )}
                  </div>
                  {!isLast && (
                    <div className="w-[2px] flex-1 mt-1.5 rounded-full bg-gradient-to-b from-neutral-300 via-neutral-200 to-neutral-100" />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 ${isLast ? 'pb-2' : 'pb-7'}`}>
                  {/* Date + Location */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs text-text-muted font-medium tabular-nums">
                      {formatDate(log.log_date)} {formatTime(log.log_time)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/8 text-primary rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {log.location}
                    </span>
                  </div>

                  {/* Log content */}
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                    {log.content}
                  </p>

                  {/* Recorder */}
                  <p className="text-xs text-text-muted mt-1.5">— {log.recorder}</p>
                </div>
              </div>
            </StaggerChildren.Item>
          );
        })}
      </StaggerChildren>
    </div>
  );
}

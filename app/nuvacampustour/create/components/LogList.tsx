'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/app/components/ui/Toast';
import { storyService } from '@/app/services/story.service';
import type { StoryLog } from '@/app/types/story';

interface LogListProps {
  logs: StoryLog[];
  isLoading: boolean;
  onDeleted: () => void;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${year}/${parseInt(month)}/${parseInt(day)}`;
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

export default function LogList({ logs, isLoading, onDeleted }: LogListProps) {
  const { showToast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      const success = await storyService.deleteLog(id);
      if (success) {
        showToast('success', 'Log 已刪除');
        onDeleted();
      } else {
        showToast('error', '刪除失敗');
      }
    } catch {
      showToast('error', '刪除失敗');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }, [showToast, onDeleted]);

  if (isLoading) {
    return (
      <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">歷史紀錄</h2>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-bg-secondary rounded w-1/3 mb-2" />
              <div className="h-3 bg-bg-secondary rounded w-full mb-1" />
              <div className="h-3 bg-bg-secondary rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
      <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        歷史紀錄
        <span className="text-sm font-normal text-text-muted">({logs.length})</span>
      </h2>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-text-secondary text-sm">還沒有紀錄</p>
          <p className="text-text-muted text-xs mt-1">新增你的第一篇故事 log</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, index) => {
            const isExpanded = expandedId === log.id;
            const isLong = log.content.length > 100;
            const displayContent = isLong && !isExpanded
              ? log.content.slice(0, 100) + '...'
              : log.content;

            return (
              <div
                key={log.id}
                className="border border-border/60 rounded-xl p-4 hover:border-border transition-colors animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-secondary">
                      {formatDate(log.log_date)} {formatTime(log.log_time)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {log.location}
                    </span>
                  </div>

                  {/* Delete */}
                  {confirmDeleteId === log.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(log.id)}
                        disabled={deletingId === log.id}
                        className="text-xs px-2 py-1 bg-error text-white rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50"
                      >
                        {deletingId === log.id ? '刪除中...' : '確定'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs px-2 py-1 bg-bg-secondary text-text-secondary rounded-lg hover:bg-bg-secondary/80 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(log.id)}
                      className="text-text-muted hover:text-error transition-colors p-1"
                      aria-label="刪除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                  {displayContent}
                </p>
                {isLong && (
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="text-xs text-primary hover:text-primary-dark mt-1 transition-colors"
                  >
                    {isExpanded ? '收合' : '展開全文'}
                  </button>
                )}

                {/* Footer */}
                <div className="mt-2 text-xs text-text-muted">
                  — {log.recorder}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { supabase } from '@/app/lib/supabase';
import { PasswordModal } from '@/app/components/ui/PasswordModal';
import type { PasswordKey } from '@/app/types/password';

interface EventInfo {
  id: string;
  title: string;
  registeredCount: number;
  lunchCount: number;
}

async function fetchEvents(): Promise<EventInfo[]> {
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('event_id, lunch_box_required');

  const eventStats: Record<string, { count: number; lunchCount: number }> = {};

  (registrations || []).forEach((reg) => {
    if (!eventStats[reg.event_id]) {
      eventStats[reg.event_id] = { count: 0, lunchCount: 0 };
    }
    eventStats[reg.event_id].count++;
    if (reg.lunch_box_required) {
      eventStats[reg.event_id].lunchCount++;
    }
  });

  return Object.entries(eventStats).map(([eventId, stats]) => ({
    id: eventId,
    title: `校園計劃 ${eventId.toUpperCase()}`,
    registeredCount: stats.count,
    lunchCount: stats.lunchCount,
  }));
}

export default function GuardianPage() {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: events, isLoading } = useSWR('guardian-events', fetchEvents, {
    revalidateOnFocus: false,
  });

  const handleEventClick = (eventId: string) => {
    setSelectedEvent(eventId);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    if (selectedEvent) {
      router.push(`/guardian/events/${selectedEvent}`);
    }
  };

  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-text-primary mb-3">
            守護者
          </h1>
          <p className="text-text-secondary">
            活動執行團隊專區
          </p>
        </div>

        {/* 進行中的活動 */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-text-primary mb-4">
            進行中的活動
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              <div className="card animate-pulse">
                <div className="h-6 w-48 bg-bg-secondary rounded mb-3" />
                <div className="flex gap-4">
                  <div className="h-8 w-24 bg-bg-secondary rounded-full" />
                  <div className="h-8 w-24 bg-bg-secondary rounded-full" />
                </div>
              </div>
            </div>
          ) : !events || events.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              目前沒有進行中的活動
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  className="w-full text-left card card-interactive"
                >
                  <h3 className="text-xl font-medium text-text-primary mb-3">
                    {event.title}
                  </h3>

                  <div className="flex gap-4 text-sm">
                    <div className="px-3 py-1 bg-bg-secondary rounded-full">
                      已報名 <span className="font-medium text-text-primary">{event.registeredCount}</span> 人
                    </div>
                    <div className="px-3 py-1 bg-bg-secondary rounded-full">
                      需便當 <span className="font-medium text-text-primary">{event.lunchCount}</span> 份
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <span className="text-primary text-sm font-medium">
                      進入執行 →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 管理功能 */}
        <div className="mt-12 pt-8 border-t border-border-light space-y-3">
          {/* Dashboard 入口 */}
          <Link
            href="/guardian/dashboard"
            className="flex items-center justify-between p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <span className="text-primary font-medium">總覽 Dashboard</span>
                <p className="text-xs text-text-muted">查看所有活動數據、編輯報名資料</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* 密碼管理入口 */}
          <Link
            href="/guardian/passwords"
            className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl hover:bg-bg-card transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span className="text-text-secondary">密碼管理</span>
            </div>
            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* 活動密碼 Modal */}
      <PasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        roleKey={`event_${selectedEvent}` as PasswordKey}
        onSuccess={handleSuccess}
        title="輸入活動密碼"
      />
    </div>
  );
}

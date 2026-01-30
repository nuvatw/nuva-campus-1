'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR, { mutate } from 'swr';
import { supabase } from '@/app/lib/supabase';
import { AuthGuard } from '@/app/components/AuthGuard';
import {
  Button,
  EmptyState,
  LoadingSpinner,
  useToast,
  StatsCard,
  StatsGrid,
  DataTable,
  SkeletonStatsGrid,
  SkeletonTable,
  type ColumnDef,
} from '@/app/components/ui';
import { eventsService } from '@/app/services/events.service';
import type { Registration } from './components/EditModal';

// 動態載入 EditModal（條件渲染，不需要 SSR）
const EditModal = dynamic(
  () => import('./components/EditModal').then(mod => ({ default: mod.EditModal })),
  { ssr: false }
);

interface EventStats {
  id: string;
  title: string;
  type: string;
  date: string | null;
  status: string;
  registrationCount: number;
  checkedInCount: number;
  lunchRequiredCount: number;
  lunchCollectedCount: number;
}

async function fetchDashboardStats() {
  return eventsService.getDashboardStats();
}

async function fetchEventsWithStats(): Promise<EventStats[]> {
  const events = await eventsService.getAllWithStats();
  return events.map(e => ({
    ...e,
    notificationPendingCount: 0,
  }));
}

async function fetchEventRegistrations(eventId: string): Promise<Registration[]> {
  const { data } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('participant_name');
  return data || [];
}

// 報名表格欄位定義
const registrationColumns: ColumnDef<Registration>[] = [
  {
    id: 'name',
    header: '姓名',
    accessor: 'participant_name',
    sortable: true,
    searchable: true,
    cell: (_, row) => (
      <span>
        {row.participant_name}
        {row.ambassador_id && (
          <span className="ml-1 text-xs text-primary">({row.ambassador_id})</span>
        )}
      </span>
    ),
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'participant_email',
    searchable: true,
  },
  {
    id: 'mode',
    header: '類型',
    accessor: (row) => row.attendance_mode === 'offline' ? '實體' : '線上',
    width: '80px',
  },
  {
    id: 'attended',
    header: '報到',
    accessor: 'attended',
    align: 'center',
    width: '60px',
    cell: (value) => value ? (
      <span className="text-success">✓</span>
    ) : (
      <span className="text-text-muted">-</span>
    ),
  },
  {
    id: 'lunch',
    header: '便當',
    accessor: 'lunch_collected',
    align: 'center',
    width: '60px',
    cell: (value, row) => !row.lunch_box_required ? (
      <span className="text-text-muted">-</span>
    ) : value ? (
      <span className="text-success">✓</span>
    ) : (
      <span className="text-warning">待領</span>
    ),
  },
];

function DashboardContent() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const { showToast } = useToast();

  const { data: stats, isLoading: statsLoading } = useSWR('dashboard-stats', fetchDashboardStats, {
    refreshInterval: 30000,
  });

  const { data: events, isLoading: eventsLoading } = useSWR('dashboard-events', fetchEventsWithStats, {
    refreshInterval: 30000,
  });

  const { data: registrations } = useSWR(
    expandedEvent ? `dashboard-registrations-${expandedEvent}` : null,
    () => expandedEvent ? fetchEventRegistrations(expandedEvent) : null,
    { refreshInterval: 10000 }
  );

  const handleSaveRegistration = async (updates: Partial<Registration>) => {
    if (!editingRegistration) return;

    const updateData: Record<string, unknown> = { ...updates };
    if (updates.attended !== editingRegistration.attended) {
      updateData.attended_at = updates.attended ? new Date().toISOString() : null;
    }
    if (updates.lunch_collected !== editingRegistration.lunch_collected) {
      updateData.lunch_collected_at = updates.lunch_collected ? new Date().toISOString() : null;
    }

    const { error } = await supabase
      .from('event_registrations')
      .update(updateData)
      .eq('id', editingRegistration.id);

    if (error) {
      showToast('error', '儲存失敗，請重試');
      return;
    }

    showToast('success', '資料已更新');
    mutate('dashboard-stats');
    mutate('dashboard-events');
    if (expandedEvent) mutate(`dashboard-registrations-${expandedEvent}`);
  };

  return (
    <div className="py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">守護者總覽</h1>
            <p className="text-text-secondary text-sm mt-1">所有活動數據一覽</p>
          </div>
          <Link
            href="/guardian"
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">返回</span>
          </Link>
        </div>

        {/* 統計卡片 */}
        {statsLoading ? (
          <SkeletonStatsGrid count={5} columns={4} />
        ) : stats ? (
          <StatsGrid columns={4} className="mb-8">
            <StatsCard title="總報名數" value={stats.totalRegistrations} />
            <StatsCard title="今日報到" value={stats.todayCheckins} variant="success" />
            <StatsCard
              title="便當領取"
              value={`${stats.lunchCollected}/${stats.lunchRequired}`}
            />
            <StatsCard
              title="待發通知"
              value={stats.pendingNotifications}
              variant={stats.pendingNotifications > 0 ? 'warning' : 'default'}
            />
          </StatsGrid>
        ) : null}

        {/* 活動列表 */}
        <div className="card">
          <h2 className="text-lg font-medium text-text-primary mb-4">活動列表</h2>

          {eventsLoading ? (
            <SkeletonTable rows={3} columns={4} />
          ) : events && events.length > 0 ? (
            <div className="space-y-2">
              {events.map(event => (
                <div key={event.id}>
                  <button
                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                    className="w-full text-left p-4 bg-bg-secondary rounded-lg hover:bg-bg-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-text-primary">{event.title}</h3>
                        <p className="text-xs text-text-muted">
                          {event.date || '日期未定'} · {event.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-text-muted">報名</p>
                          <p className="font-semibold">{event.registrationCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-text-muted">報到</p>
                          <p className="font-semibold text-primary">{event.checkedInCount}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-text-muted">便當</p>
                          <p className="font-semibold">
                            {event.lunchCollectedCount}/{event.lunchRequiredCount}
                          </p>
                        </div>
                        <svg
                          className={`w-5 h-5 text-text-muted transition-transform ${expandedEvent === event.id ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {expandedEvent === event.id && (
                    <div className="mt-2 p-4 bg-bg-primary rounded-lg border border-border-light">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-text-primary">報名詳情</h4>
                        <Link href={`/guardian/events/${event.id}`} className="text-primary text-sm hover:underline">
                          前往活動管理 →
                        </Link>
                      </div>

                      {registrations ? (
                        <DataTable
                          data={registrations}
                          columns={[
                            ...registrationColumns,
                            {
                              id: 'actions',
                              header: '操作',
                              accessor: () => null,
                              align: 'right',
                              width: '80px',
                              cell: (_, row) => (
                                <Button variant="ghost" size="sm" onClick={() => setEditingRegistration(row)}>
                                  編輯
                                </Button>
                              ),
                            },
                          ]}
                          getRowKey={(row) => row.id}
                          searchable
                          searchPlaceholder="搜尋姓名或 Email..."
                          compact
                          showPagination={registrations.length > 10}
                          defaultPageSize={10}
                        />
                      ) : (
                        <div className="flex justify-center py-4">
                          <LoadingSpinner size="sm" label="載入報名資料" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="目前沒有活動資料"
              description="活動報名資料將會顯示在這裡"
            />
          )}
        </div>

        {/* 快速操作 */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/guardian', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', label: '活動執行' },
            { href: '/guardian/passwords', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', label: '密碼管理' },
            { href: '/ambassador', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', label: '校園大使' },
            { href: '/nunu', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: '努努專區' },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href} className="card card-interactive text-center py-6">
              <svg className="w-8 h-8 mx-auto mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
              </svg>
              <span className="text-sm text-text-primary">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 動態載入的 EditModal */}
      {editingRegistration && (
        <EditModal
          registration={editingRegistration}
          onClose={() => setEditingRegistration(null)}
          onSave={handleSaveRegistration}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard roleKey="guardian_admin" title="守護者總覽" redirectOnFail="/guardian">
      <DashboardContent />
    </AuthGuard>
  );
}

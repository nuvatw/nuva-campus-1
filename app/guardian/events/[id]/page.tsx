'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { supabase } from '@/app/lib/supabase';

interface EventStats {
  totalRegistered: number;
  checkedIn: number;
  totalLunch: number;
  lunchCollected: number;
  notificationSent: number;
  notificationPending: number;
}

async function fetchStats(eventId: string): Promise<EventStats> {
  const { data } = await supabase
    .from('event_registrations')
    .select('attended, lunch_box_required, lunch_collected, notification_sent')
    .eq('event_id', eventId);

  const registrations = data || [];

  return {
    totalRegistered: registrations.length,
    checkedIn: registrations.filter(r => r.attended).length,
    totalLunch: registrations.filter(r => r.lunch_box_required).length,
    lunchCollected: registrations.filter(r => r.lunch_collected).length,
    notificationSent: registrations.filter(r => r.notification_sent).length,
    notificationPending: registrations.filter(r => !r.notification_sent).length,
  };
}

function LoadingSkeleton() {
  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card animate-pulse">
            <div className="h-32 bg-bg-secondary rounded" />
          </div>
          <div className="card animate-pulse">
            <div className="h-32 bg-bg-secondary rounded" />
          </div>
        </div>
        <div className="card animate-pulse">
          <div className="h-24 bg-bg-secondary rounded" />
        </div>
      </div>
    </div>
  );
}

export default function EventDashboard() {
  const params = useParams();
  const eventId = params.id as string;

  const { data: stats, isLoading } = useSWR(
    eventId ? `event-stats-${eventId}` : null,
    () => fetchStats(eventId),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  if (isLoading || !stats) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* 報到和便當統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* 報到 */}
          <Link
            href={`/guardian/events/${eventId}/checkin`}
            className="card card-interactive"
          >
            <div className="text-center">
              <h3 className="text-lg font-medium text-text-primary mb-4">報到</h3>
              <div className="w-16 h-px bg-border mx-auto mb-4" />
              <div className="text-4xl font-semibold text-primary mb-2">
                {stats.checkedIn}
                <span className="text-xl text-text-muted">/{stats.totalRegistered}</span>
              </div>
              <p className="text-sm text-text-secondary">已報到人數</p>
            </div>
          </Link>

          {/* 便當 */}
          <Link
            href={`/guardian/events/${eventId}/lunch`}
            className="card card-interactive"
          >
            <div className="text-center">
              <h3 className="text-lg font-medium text-text-primary mb-4">便當領取</h3>
              <div className="w-16 h-px bg-border mx-auto mb-4" />
              <div className="text-4xl font-semibold text-primary mb-2">
                {stats.lunchCollected}
                <span className="text-xl text-text-muted">/{stats.totalLunch}</span>
              </div>
              <p className="text-sm text-text-secondary">已領取便當</p>
            </div>
          </Link>
        </div>

        {/* 發送通知 */}
        <Link
          href={`/guardian/events/${eventId}/notify`}
          className="card card-interactive block"
        >
          <h3 className="text-lg font-medium text-text-primary mb-2">發送通知</h3>
          <div className="w-12 h-px bg-border mb-4" />

          <div className="flex gap-8">
            <div>
              <p className="text-sm text-text-secondary mb-1">已發送</p>
              <p className="text-2xl font-semibold text-text-primary">{stats.notificationSent}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary mb-1">未發送</p>
              <p className="text-2xl font-semibold text-warning">{stats.notificationPending}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <span className="text-primary text-sm font-medium">
              管理通知 →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

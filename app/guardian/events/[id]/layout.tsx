'use client';

import { useParams } from 'next/navigation';
import { Breadcrumbs, BottomNav } from '@/app/components/layout';

const bottomNavItems = (eventId: string) => [
  {
    href: `/guardian/events/${eventId}`,
    label: '總覽',
    icon: <span>📋</span>,
  },
  {
    href: `/guardian/events/${eventId}/checkin`,
    label: '報到',
    icon: <span>✅</span>,
  },
  {
    href: `/guardian/events/${eventId}/lunch`,
    label: '便當',
    icon: <span>🍱</span>,
  },
  {
    href: `/guardian/events/${eventId}/notify`,
    label: '通知',
    icon: <span>🔔</span>,
  },
];

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const eventId = params.id as string;

  return (
    <div>
      <div className="border-b border-border-light bg-bg-card">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <Breadcrumbs
            labelMap={{ [eventId]: `校園計劃 ${eventId.toUpperCase()}` }}
          />
        </div>
      </div>
      <div className="pb-16 sm:pb-0">
        {children}
      </div>
      <BottomNav items={bottomNavItems(eventId)} />
    </div>
  );
}

'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

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
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/guardian"
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">返回活動列表</span>
          </Link>
          <span className="text-sm text-text-muted">校園計劃 {eventId.toUpperCase()}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

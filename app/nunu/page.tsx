'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { nunuEvents } from '@/app/data/nunu-events';
import { PageHeader } from '@/app/components/layout';

export default function NunuPage() {
  const router = useRouter();

  return (
    <div>
      <div className="max-w-lg mx-auto px-4 py-6">
        <PageHeader title="活動一覽" subtitle="Nunu Events" variant="left" maxWidth="max-w-lg" />

        <div className="space-y-3">
          {nunuEvents.map((event) => {
            const eventDate = new Date(event.date);

            return (
              <div
                key={event.id}
                onClick={() => router.push(`/nunu/events/${event.id}`)}
                className="group block bg-bg-card rounded-xl border border-border hover:border-primary-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-primary-50 text-primary text-[10px] font-medium rounded-full">
                          即將舉辦
                        </span>
                        {event.preMeeting && (
                          <span className="px-2 py-0.5 bg-bg-secondary text-text-secondary text-[10px] rounded-full">
                            有行前會議
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-medium text-text-primary mb-2 truncate">
                        {event.title}
                      </h2>
                      <div className="space-y-1 text-text-secondary text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-text-muted">📅</span>
                          <span>
                            {eventDate.toLocaleDateString('zh-TW', {
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </span>
                          <span className="text-border-light">·</span>
                          <span>{event.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-text-muted">📍</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Link
                        href={`/nunu/events/${event.id}/run`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-error-light hover:bg-error text-error hover:text-white text-xs font-medium rounded-lg border border-error/20 hover:border-error transition-all"
                      >
                        執行
                      </Link>
                      <div className="flex items-center text-primary text-xs group-hover:text-primary-600 transition-colors">
                        <span>詳情</span>
                        <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {nunuEvents.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            目前沒有活動
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { nunuEvents } from '@/app/data/nunu-events';

export default function NunuPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <p className="text-xs tracking-widest text-stone-400 mb-2">NUNU EVENTS</p>
          <h1 className="text-2xl sm:text-3xl font-light text-stone-800 tracking-tight">活動一覽</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-4">
          {nunuEvents.map((event) => {
            const eventDate = new Date(event.date);

            return (
              <div
                key={event.id}
                onClick={() => router.push(`/nunu/events/${event.id}`)}
                className="block bg-white rounded-lg border border-stone-200 hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-600 text-xs rounded border border-sky-100">
                          即將舉辦
                        </span>
                        {event.preMeeting && (
                          <span className="px-2 py-0.5 bg-stone-50 text-stone-500 text-xs rounded border border-stone-200">
                            有行前會議
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-medium text-stone-800 mb-4">
                        {event.title}
                      </h2>
                      <div className="space-y-2 text-stone-500 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center text-stone-400">📅</span>
                          <span>
                            {eventDate.toLocaleDateString('zh-TW', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center text-stone-400">🕐</span>
                          <span>{event.startTime} ~ {event.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center text-stone-400">📍</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/nunu/events/${event.id}/run`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white text-xs font-medium rounded-lg border border-rose-200 hover:border-rose-500 transition-all"
                      >
                        執行
                      </Link>
                      <div className="flex items-center text-sky-500 text-sm">
                        <span>詳情</span>
                        <span className="ml-1">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {nunuEvents.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            目前沒有活動
          </div>
        )}
      </div>
    </div>
  );
}

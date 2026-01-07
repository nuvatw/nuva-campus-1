'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { nunuEvents } from '@/app/data/nunu-events';

export default function NunuPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <p className="text-[10px] tracking-widest text-slate-400 uppercase">Nunu Events</p>
          <h1 className="text-lg font-semibold text-slate-800">活動一覽</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="space-y-3">
          {nunuEvents.map((event) => {
            const eventDate = new Date(event.date);

            return (
              <div
                key={event.id}
                onClick={() => router.push(`/nunu/events/${event.id}`)}
                className="group block bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-600 text-[10px] font-medium rounded-full">
                          即將舉辦
                        </span>
                        {event.preMeeting && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-full">
                            有行前會議
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-medium text-slate-800 mb-2 truncate">
                        {event.title}
                      </h2>
                      <div className="space-y-1 text-slate-500 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">📅</span>
                          <span>
                            {eventDate.toLocaleDateString('zh-TW', {
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span>{event.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">📍</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Link
                        href={`/nunu/events/${event.id}/run`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white text-xs font-medium rounded-lg border border-rose-200 hover:border-rose-500 transition-all"
                      >
                        執行
                      </Link>
                      <div className="flex items-center text-sky-500 text-xs group-hover:text-sky-600 transition-colors">
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
          <div className="text-center py-16 text-slate-400">
            目前沒有活動
          </div>
        )}
      </div>
    </div>
  );
}

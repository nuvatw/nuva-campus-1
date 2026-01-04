'use client';

import Link from 'next/link';
import { nunuEvents } from '@/app/data/nunu-events';

export default function NunuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium">
              隱藏頁面
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Nunu 活動</h1>
          <p className="text-white/60 text-sm mt-2">接下來的活動列表</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="grid gap-4 sm:gap-6">
          {nunuEvents.map((event) => {
            const eventDate = new Date(event.date);
            const isUpcoming = eventDate >= new Date();

            return (
              <Link
                key={event.id}
                href={`/nunu/events/${event.id}`}
                className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 p-1 hover:from-purple-500/30 hover:via-pink-500/30 hover:to-purple-500/30 transition-all group"
              >
                <div className="bg-slate-900/90 backdrop-blur rounded-xl p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {isUpcoming && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full font-medium">
                            即將舉辦
                          </span>
                        )}
                        {event.preMeeting && (
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs rounded-full font-medium">
                            有行前會議
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                        {event.title}
                      </h2>
                      <div className="mt-4 space-y-2 text-white/70 text-sm sm:text-base">
                        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 w-fit">
                          <span>📅</span>
                          <span>
                            {eventDate.toLocaleDateString('zh-TW', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 w-fit">
                          <span>🕐</span>
                          <span>{event.startTime} ~ {event.endTime}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 w-fit">
                          <span>📍</span>
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg px-3 py-2 w-fit">
                          <span>🚩</span>
                          <span className="text-amber-300">集合時間：{event.meetingTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-white/70 font-medium group-hover:text-white group-hover:translate-x-2 transition-all">
                      <span>查看詳情</span>
                      <span className="ml-2 text-xl">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {nunuEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-white/50">目前沒有活動</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { nunuEvents } from '@/app/data/nunu-events';

export default function NunuPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Nunu 活動</h1>
          <p className="text-gray-500 text-sm mt-1">接下來的活動列表</p>
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
                className="block bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/30 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isUpcoming && (
                        <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                          即將舉辦
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-primary transition-colors">
                      {event.title}
                    </h2>
                    <div className="mt-3 space-y-2 text-gray-600 text-sm sm:text-base">
                      <div className="flex items-center gap-2">
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
                      <div className="flex items-center gap-2">
                        <span>🕐</span>
                        <span>{event.startTime} ~ {event.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🚩</span>
                        <span>集合時間：{event.meetingTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                    <span>查看詳情</span>
                    <span className="ml-1">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {nunuEvents.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            目前沒有活動
          </div>
        )}
      </div>
    </div>
  );
}

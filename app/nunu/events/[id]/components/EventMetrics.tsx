'use client';

import { useEffect, useState } from 'react';
import { AnimatedCounter } from '@/app/components/ui';
import { FadeIn } from '@/app/components/motion';
import type { NunuEvent, NunuEventRegistration } from '@/app/types/nunu';

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isExpired: false,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

interface EventMetricsProps {
  event: NunuEvent;
  registrations: NunuEventRegistration[];
}

export function EventMetrics({ event, registrations }: EventMetricsProps) {
  const preMeetingCountdown = useCountdown(
    event.preMeeting ? `${event.preMeeting.date}T${event.preMeeting.startTime}:00+08:00` : ''
  );

  return (
    <>
      {/* Pre-meeting Countdown */}
      {event.preMeeting && (
        <FadeIn className="col-span-12 lg:col-span-5">
          <div className="bg-bg-card rounded-2xl p-5 border border-border hover:border-primary-300 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-primary tracking-widest uppercase font-medium">Pre-meeting</p>
                <h3 className="text-lg font-semibold text-text-primary mt-1">行前線上會議</h3>
              </div>
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            </div>

            <p className="text-sm text-text-secondary mb-4">
              {new Date(event.preMeeting.date).toLocaleDateString('zh-TW', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })} · {event.preMeeting.startTime}
            </p>

            {!preMeetingCountdown.isExpired ? (
              <div className="flex items-end justify-between">
                <div className="flex gap-2">
                  {[
                    { value: preMeetingCountdown.days, label: '天' },
                    { value: preMeetingCountdown.hours, label: '時' },
                    { value: preMeetingCountdown.minutes, label: '分' },
                    { value: preMeetingCountdown.seconds, label: '秒', highlight: true },
                  ].map((item, i) => (
                    <div key={i} className={`text-center px-3 py-2 rounded-lg ${item.highlight ? 'bg-primary-50' : 'bg-bg-secondary'}`}>
                      <div className={`text-xl font-semibold tabular-nums ${item.highlight ? 'text-primary' : 'text-text-primary'}`}>
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-text-muted">{item.label}</div>
                    </div>
                  ))}
                </div>
                <a
                  href={event.preMeeting.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-bg-secondary hover:bg-primary text-text-secondary hover:text-white text-sm rounded-lg transition-all hover:shadow-lg"
                >
                  加入會議 →
                </a>
              </div>
            ) : (
              <a
                href={event.preMeeting.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-success hover:bg-success/90 text-white text-sm font-medium rounded-lg transition-all animate-pulse"
              >
                <span className="w-2 h-2 bg-white rounded-full" />
                會議進行中
              </a>
            )}
          </div>
        </FadeIn>
      )}

      {/* Registration Count */}
      <FadeIn delay={0.05} className={`${event.preMeeting ? 'col-span-6 lg:col-span-3' : 'col-span-6 lg:col-span-4'}`}>
        <div className="bg-bg-card rounded-2xl p-5 border border-border hover:border-success/30 hover:shadow-lg hover:shadow-success/5 transition-all duration-300 group h-full">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] text-success tracking-widest uppercase font-medium">Participants</p>
            <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center group-hover:bg-success/15 transition-colors">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-text-primary mb-1 tabular-nums">
            <AnimatedCounter value={registrations.length} />
          </div>
          <p className="text-sm text-text-muted">位努努已報名</p>
        </div>
      </FadeIn>

      {/* Event Info */}
      <FadeIn delay={0.1} className={`${event.preMeeting ? 'col-span-6 lg:col-span-4' : 'col-span-6 lg:col-span-4'}`}>
        <div className="bg-bg-card rounded-2xl p-5 border border-border hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 group h-full">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] text-amber-500 tracking-widest uppercase font-medium">Event Info</p>
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">活動日期</span>
              <span className="text-text-primary font-medium">
                {new Date(event.date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">活動時間</span>
              <span className="text-text-primary">{event.startTime} ~ {event.endTime}</span>
            </div>
            {event.picnicTime && (
              <div className="flex justify-between">
                <span className="text-text-muted">戶外野餐</span>
                <span className="text-text-primary">{event.picnicTime}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-border-light">
              <span className="text-amber-500 font-medium">集合時間</span>
              <span className="text-amber-600 font-medium">{event.meetingTime} AM</span>
            </div>
          </div>
        </div>
      </FadeIn>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { m } from 'motion/react';
import { supabase } from '@/app/lib/supabase';
import { workshops } from '@/app/data/workshops';
import { Ambassador } from '@/app/types/ambassador';
import { EventRegistration } from '@/app/types/workshop';
import YouTubeEmbed from '@/app/components/ui/YouTubeEmbed';
import { FadeIn, useReducedMotion } from '@/app/components/motion';
import { AnimatedCounter } from '@/app/components/ui/AnimatedCounter';
import { Badge } from '@/app/components/ui/Badge';
import { spring } from '@/app/styles/tokens';

export default function WorkshopDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const prefersReduced = useReducedMotion();

  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const workshop = workshops.find((w) => w.id.toLowerCase() === id?.toLowerCase());

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      try {
        const { data: ambassadorData } = await supabase
          .from('ambassadors')
          .select('*')
          .eq('is_alive', true)
          .order('ambassador_id', { ascending: true });

        if (ambassadorData) setAmbassadors(ambassadorData);

        const eventId = id.toLowerCase();
        const { data: registrationData } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('event_id', eventId)
          .order('registered_at', { ascending: true });

        if (registrationData) setRegistrations(registrationData);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (!workshop) {
    notFound();
  }

  const ambassadorRegistrations = registrations.filter((r) => r.member_type === 'ambassador');
  const nunuRegistrations = registrations.filter((r) => r.member_type === 'nunu');

  const registeredAmbassadorIds = ambassadorRegistrations.map((r) => r.ambassador_id);
  const notRegisteredAmbassadors = ambassadors.filter((a) => !registeredAmbassadorIds.includes(a.ambassador_id));

  const offlineAmbassadors = ambassadorRegistrations
    .filter((r) => r.attendance_mode === 'offline')
    .sort((a, b) => parseInt(a.ambassador_id || '0') - parseInt(b.ambassador_id || '0'));
  const offlineNunu = nunuRegistrations
    .filter((r) => r.attendance_mode === 'offline')
    .sort((a, b) => a.participant_name.localeCompare(b.participant_name, 'zh-TW'));

  const onlineAmbassadors = ambassadorRegistrations
    .filter((r) => r.attendance_mode === 'online')
    .sort((a, b) => parseInt(a.ambassador_id || '0') - parseInt(b.ambassador_id || '0'));
  const onlineNunu = nunuRegistrations
    .filter((r) => r.attendance_mode === 'online')
    .sort((a, b) => a.participant_name.localeCompare(b.participant_name, 'zh-TW'));

  const totalCount = registrations.length;
  const offlineCount = offlineAmbassadors.length + offlineNunu.length;
  const onlineCount = onlineAmbassadors.length + onlineNunu.length;
  const lunchBoxCount = registrations.filter((r) => r.lunch_box_required).length;

  const offlinePercent = totalCount > 0 ? (offlineCount / totalCount) * 100 : 0;
  const onlinePercent = totalCount > 0 ? (onlineCount / totalCount) * 100 : 0;

  const circumference = 2 * Math.PI * 15.9;
  const offlineDash = (offlinePercent / 100) * circumference;
  const onlineDash = (onlinePercent / 100) * circumference;

  const tallyUrl = workshop.tallyFormId ? `#tally-open=${workshop.tallyFormId}&tally-emoji-text=👋&tally-emoji-animation=wave` : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-muted">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Script src="https://tally.so/widgets/embed.js" strategy="afterInteractive" />

      {/* Header */}
      <header className="bg-bg-card border-b border-border sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
            <Link href="/ambassadors" className="text-text-secondary hover:text-text-primary transition-colors text-sm sm:text-base whitespace-nowrap">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回
              </span>
            </Link>
            <div className="w-px h-4 sm:h-6 bg-border" />
            <Badge variant="primary" dot>
              {workshop.type === 'offline' ? '實體' : '線上'}
            </Badge>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-text-primary sm:mt-0">{workshop.title}</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {workshop.youtubeVideoId && (
            <FadeIn>
              <YouTubeEmbed videoId={workshop.youtubeVideoId} title={workshop.title} />
            </FadeIn>
          )}

          {/* Info + Stats row */}
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-bg-card rounded-xl p-4 sm:p-6 shadow-elevation-1 border border-border">
                <h3 className="text-base sm:text-lg font-bold text-text-primary mb-4">工作坊資訊</h3>
                <div className="space-y-3 text-text-secondary text-sm sm:text-base">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(workshop.date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}</span>
                  </div>
                  {workshop.checkinTime && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>報到時間：{workshop.checkinTime}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{workshop.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>
                      {workshop.location}
                      {workshop.locationUrl && (
                        <a href={workshop.locationUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline">
                          (Google Map)
                        </a>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-bg-card rounded-xl p-4 sm:p-6 shadow-elevation-1 border border-border">
                <h3 className="text-base sm:text-lg font-bold text-text-primary mb-4 text-center">報名統計</h3>
                <div className="flex items-center justify-center gap-6 sm:gap-8">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-border)" strokeWidth="3" />
                      <m.circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke="var(--color-success)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${circumference}`}
                        initial={prefersReduced ? { strokeDashoffset: circumference - offlineDash } : { strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - offlineDash }}
                        transition={{ duration: 0.8, ease: [0.2, 0, 0, 1], delay: 0.3 }}
                      />
                      <m.circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${circumference}`}
                        initial={prefersReduced ? { strokeDashoffset: circumference - onlineDash + offlineDash } : { strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - onlineDash }}
                        transition={{ duration: 0.8, ease: [0.2, 0, 0, 1], delay: 0.5 }}
                        style={{ strokeDashoffset: `${circumference - onlineDash}` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl sm:text-2xl font-bold text-text-primary">
                        <AnimatedCounter value={totalCount} />
                      </span>
                      <span className="text-xs text-text-muted">總報名</span>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-success rounded-full" />
                      <span className="text-text-secondary">實體 <AnimatedCounter value={offlineCount} /> 人</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full" />
                      <span className="text-text-secondary">線上 <AnimatedCounter value={onlineCount} /> 人</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-text-secondary">便當 <AnimatedCounter value={lunchBoxCount} /> 份</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Schedule */}
          {workshop.schedule && workshop.schedule.length > 0 && (
            <FadeIn delay={0.1}>
              <div className="bg-bg-card rounded-xl p-4 sm:p-6 shadow-elevation-1 border border-border">
                <h3 className="text-base sm:text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  活動細流
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 sm:px-4 text-text-secondary font-semibold whitespace-nowrap">時段</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-text-secondary font-semibold">單元名稱</th>
                        <th className="text-left py-3 px-2 sm:px-4 text-text-secondary font-semibold hidden sm:table-cell">內容重點</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workshop.schedule.map((item, index) => (
                        <tr key={index} className={`border-b border-border ${item.title === '午休' ? 'bg-accent/10' : 'hover:bg-bg-secondary'}`}>
                          <td className="py-3 px-2 sm:px-4 text-text-muted whitespace-nowrap font-mono text-xs sm:text-sm">{item.time}</td>
                          <td className="py-3 px-2 sm:px-4 font-medium text-text-primary">
                            {item.title}
                            <div className="sm:hidden text-xs text-text-muted mt-1">{item.description}</div>
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-text-secondary hidden sm:table-cell">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Not registered */}
          <FadeIn delay={0.15}>
            <div className="bg-bg-card rounded-xl p-4 sm:p-6 shadow-elevation-1 border border-border">
              <h3 className="text-base sm:text-lg font-bold text-text-secondary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                尚未報名 ({notRegisteredAmbassadors.length})
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
                {notRegisteredAmbassadors.map((ambassador) => (
                  <div key={ambassador.id} className="bg-bg-secondary border-2 border-border rounded-lg p-1.5 sm:p-2 text-center hover:shadow-elevation-2 transition-all">
                    <div className="text-[10px] sm:text-xs font-bold text-text-muted">#{ambassador.ambassador_id}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-text-secondary truncate">{ambassador.name}</div>
                  </div>
                ))}
              </div>
              {notRegisteredAmbassadors.length === 0 && (
                <p className="text-text-muted text-center py-8">太棒了！所有校園大使都已報名</p>
              )}
            </div>
          </FadeIn>

          {/* Offline */}
          <FadeIn delay={0.2}>
            <div className="bg-bg-card rounded-xl p-4 sm:p-6 shadow-elevation-1 border border-border">
              <h3 className="text-base sm:text-lg font-bold text-success mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                實體參與 ({offlineAmbassadors.length + offlineNunu.length})
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
                {offlineAmbassadors.map((reg) => {
                  const ambassador = ambassadors.find((a) => a.ambassador_id === reg.ambassador_id);
                  return (
                    <div key={reg.id} className="bg-gradient-to-br from-success/10 to-success/5 border-2 border-success rounded-lg p-1.5 sm:p-2 text-center hover:shadow-elevation-2 transition-all relative">
                      {reg.lunch_box_required && (
                        <div className="absolute -top-1 -right-1">
                          <Badge variant="warning" size="sm">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </Badge>
                        </div>
                      )}
                      <div className="text-[10px] sm:text-xs font-bold text-success">#{reg.ambassador_id}</div>
                      <div className="text-[10px] sm:text-xs font-medium text-success truncate">{ambassador?.name || reg.participant_name}</div>
                    </div>
                  );
                })}
                {offlineNunu.map((reg) => (
                  <div key={reg.id} className="bg-gradient-to-br from-success/10 to-success/5 border-2 border-success rounded-lg p-1.5 sm:p-2 text-center hover:shadow-elevation-2 transition-all relative">
                    {reg.lunch_box_required && (
                      <div className="absolute -top-1 -right-1">
                        <Badge variant="warning" size="sm">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </Badge>
                      </div>
                    )}
                    <div className="text-[10px] sm:text-xs font-bold text-success">努努</div>
                    <div className="text-[10px] sm:text-xs font-medium text-success truncate">{reg.participant_name}</div>
                  </div>
                ))}
              </div>
              {offlineAmbassadors.length + offlineNunu.length === 0 && (
                <p className="text-text-muted text-center py-8">還沒有人選擇實體參與</p>
              )}
            </div>
          </FadeIn>

          {/* Online */}
          <FadeIn delay={0.25}>
            <div className="bg-bg-card rounded-xl p-4 sm:p-6 shadow-elevation-1 border border-border">
              <h3 className="text-base sm:text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                線上參與 ({onlineAmbassadors.length + onlineNunu.length})
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
                {onlineAmbassadors.map((reg) => {
                  const ambassador = ambassadors.find((a) => a.ambassador_id === reg.ambassador_id);
                  return (
                    <div key={reg.id} className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary rounded-lg p-1.5 sm:p-2 text-center hover:shadow-elevation-2 transition-all">
                      <div className="text-[10px] sm:text-xs font-bold text-primary">#{reg.ambassador_id}</div>
                      <div className="text-[10px] sm:text-xs font-medium text-primary truncate">{ambassador?.name || reg.participant_name}</div>
                    </div>
                  );
                })}
                {onlineNunu.map((reg) => (
                  <div key={reg.id} className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary rounded-lg p-1.5 sm:p-2 text-center hover:shadow-elevation-2 transition-all">
                    <div className="text-[10px] sm:text-xs font-bold text-primary">努努</div>
                    <div className="text-[10px] sm:text-xs font-medium text-primary truncate">{reg.participant_name}</div>
                  </div>
                ))}
              </div>
              {onlineAmbassadors.length + onlineNunu.length === 0 && (
                <p className="text-text-muted text-center py-8">還沒有人選擇線上參與</p>
              )}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Floating register button */}
      {workshop.tallyFormId && (
        <m.a
          href={tallyUrl}
          className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-full shadow-elevation-4 flex items-center gap-2 text-sm sm:text-base"
          whileHover={prefersReduced ? undefined : { scale: 1.05, boxShadow: '0 16px 32px -8px rgba(59, 130, 246, 0.3)' }}
          whileTap={prefersReduced ? undefined : { scale: 0.95 }}
          transition={spring.tactile}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>立即報名</span>
        </m.a>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { m } from 'motion/react';
import { supabase } from '@/app/lib/supabase';
import { FadeIn, useReducedMotion } from '@/app/components/motion';
import { AnimatedCounter } from '@/app/components/ui/AnimatedCounter';
import { Badge } from '@/app/components/ui/Badge';
import { Countdown } from '@/app/components/ui/Countdown';
import { spring } from '@/app/styles/tokens';

interface Mission {
  id: string;
  name: string;
  status: string;
  description: string;
  due_date: string | null;
}

interface Ambassador {
  id: string;
  ambassador_id: string;
  name: string;
  is_alive: boolean;
  school?: string;
}

interface Submission {
  id: string;
  mission_id: string;
  ambassador_id: string;
  name: string;
  email: string;
  submitted: boolean;
  submitted_at: string;
  file_url: string | null;
  note: string | null;
}

export default function MissionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const prefersReduced = useReducedMotion();

  const [mission, setMission] = useState<Mission | null>(null);
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: missionData } = await supabase
          .from('missions')
          .select('*')
          .eq('id', id.toLowerCase())
          .single();

        if (missionData) setMission(missionData);

        const { data: ambassadorData } = await supabase
          .from('ambassadors')
          .select('*')
          .eq('is_alive', true)
          .order('ambassador_id', { ascending: true });

        if (ambassadorData) setAmbassadors(ambassadorData);

        const { data: submissionData } = await supabase
          .from('mission_submissions')
          .select('*')
          .eq('mission_id', id.toLowerCase())
          .order('submitted_at', { ascending: true });

        if (submissionData) setSubmissions(submissionData);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    const channel = supabase
      .channel('mission-submissions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_submissions' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse text-text-muted">載入中...</div>
      </div>
    );
  }

  if (!mission) {
    notFound();
  }

  const submittedAmbassadorIds = submissions.map((s) => s.ambassador_id);
  const submittedAmbassadors = ambassadors.filter((a) => submittedAmbassadorIds.includes(a.ambassador_id));
  const notSubmittedAmbassadors = ambassadors.filter((a) => !submittedAmbassadorIds.includes(a.ambassador_id));

  const totalAmbassadors = ambassadors.length;
  const submittedCount = submittedAmbassadors.length;
  const submissionRate = totalAmbassadors > 0 ? Math.round((submittedCount / totalAmbassadors) * 100) : 0;

  const tallyUrl = '#tally-open=5BB8Yo&tally-emoji-text=👋&tally-emoji-animation=wave';
  const missionDisplay = mission.id.toUpperCase();

  // Progress ring values
  const circumference = 2 * Math.PI * 15.9;
  const submissionDash = (submissionRate / 100) * circumference;

  // Urgency for countdown
  const dueDate = mission.due_date ? new Date(mission.due_date + 'T23:59:59') : null;
  const hoursLeft = dueDate ? (dueDate.getTime() - Date.now()) / (1000 * 60 * 60) : Infinity;
  let countdownBorder = 'border-primary/20';
  let countdownText = 'text-primary';
  if (hoursLeft <= 0) {
    countdownBorder = 'border-border';
    countdownText = 'text-text-muted';
  } else if (hoursLeft <= 24) {
    countdownBorder = 'border-error/30';
    countdownText = 'text-error';
  } else if (hoursLeft <= 72) {
    countdownBorder = 'border-warning/30';
    countdownText = 'text-warning';
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Script src="https://tally.so/widgets/embed.js" strategy="afterInteractive" />

      {/* Header */}
      <header className="bg-bg-card border-b border-border sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/ambassadors" className="text-text-secondary hover:text-text-primary transition-colors text-sm sm:text-base">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回
              </span>
            </Link>
            <div className="w-px h-4 sm:h-6 bg-border" />
            <h1 className="text-lg sm:text-2xl font-bold text-text-primary">{missionDisplay}</h1>
            <Badge
              variant={mission.status === 'ongoing' ? 'primary' : mission.status === 'done' ? 'success' : 'default'}
              dot
            >
              {mission.status === 'ongoing' ? '進行中' : mission.status === 'done' ? '已完成' : '未開放'}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Info + Countdown row */}
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-bg-card rounded-xl p-4 sm:p-6 shadow-elevation-1 border border-border">
                <h3 className="text-base sm:text-lg font-bold text-text-primary mb-4">任務資訊</h3>
                <div className="space-y-3 text-text-secondary">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-medium">{mission.name}</span>
                  </div>
                  {mission.description && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      <span className="whitespace-pre-line">{mission.description}</span>
                    </div>
                  )}
                  {mission.due_date && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>截止日期：{new Date(mission.due_date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>

              {mission.due_date && mission.status === 'ongoing' && (
                <m.div
                  className={`bg-bg-card rounded-xl p-4 sm:p-6 shadow-elevation-1 border-2 ${countdownBorder} text-center flex flex-col justify-center relative overflow-hidden`}
                  initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {hoursLeft <= 24 && hoursLeft > 0 && !prefersReduced && (
                    <span className="absolute inset-0 rounded-xl border-2 border-error/30 animate-ping pointer-events-none" />
                  )}
                  <div className="text-sm text-text-muted mb-2 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    繳交倒數
                  </div>
                  <div className={`text-2xl sm:text-3xl font-bold ${countdownText} tabular-nums`}>
                    <Countdown targetDate={dueDate!} completedText="已截止" />
                  </div>
                </m.div>
              )}
            </div>
          </FadeIn>

          {/* Stats row with animated counters and progress ring */}
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-bg-card rounded-xl p-4 shadow-elevation-1 text-center border-2 border-primary/20 relative overflow-hidden">
                {/* Mini progress ring */}
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-2 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-border)" strokeWidth="2" />
                    <m.circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${circumference}`}
                      initial={prefersReduced ? { strokeDashoffset: circumference - submissionDash } : { strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: circumference - submissionDash }}
                      transition={{ duration: 1, ease: [0.2, 0, 0, 1], delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg sm:text-xl font-bold text-primary">
                      <AnimatedCounter value={submissionRate} />%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-primary font-medium">繳交率</div>
              </div>
              <div className="bg-success/5 rounded-xl p-4 shadow-elevation-1 text-center border-2 border-success/20">
                <div className="text-2xl sm:text-3xl font-bold text-success">
                  <AnimatedCounter value={submittedCount} />
                </div>
                <div className="text-sm text-success mt-1">已繳交</div>
              </div>
              <div className="bg-bg-secondary rounded-xl p-4 shadow-elevation-1 text-center border-2 border-border">
                <div className="text-2xl sm:text-3xl font-bold text-text-secondary">
                  <AnimatedCounter value={notSubmittedAmbassadors.length} />
                </div>
                <div className="text-sm text-text-muted mt-1">未繳交</div>
              </div>
            </div>
          </FadeIn>

          {/* Progress bar */}
          <FadeIn delay={0.15}>
            <div className="bg-bg-card rounded-xl p-4 sm:p-6 shadow-elevation-1 border border-border">
              <div className="flex justify-between text-sm text-text-secondary mb-2">
                <span>繳交進度</span>
                <span className="font-medium tabular-nums">{submittedCount} / {totalAmbassadors} 人</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden">
                <m.div
                  className="bg-gradient-to-r from-primary to-success h-4 rounded-full"
                  initial={prefersReduced ? { width: `${submissionRate}%` } : { width: '0%' }}
                  animate={{ width: `${submissionRate}%` }}
                  transition={{ duration: 0.8, ease: [0.2, 0, 0, 1], delay: 0.2 }}
                />
              </div>
            </div>
          </FadeIn>

          {/* Not submitted */}
          <FadeIn delay={0.2}>
            <div className="bg-bg-card rounded-xl p-4 sm:p-6 shadow-elevation-1 border border-border">
              <h3 className="text-base sm:text-lg font-bold text-text-secondary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                尚未繳交 ({notSubmittedAmbassadors.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                {notSubmittedAmbassadors.map((ambassador) => (
                  <div key={ambassador.id} className="bg-bg-secondary border-2 border-border rounded-lg p-2 sm:p-3 text-center hover:shadow-elevation-2 transition-all">
                    <div className="text-xs font-bold text-text-muted mb-1">#{ambassador.ambassador_id}</div>
                    <div className="text-sm font-medium text-text-secondary">{ambassador.name}</div>
                  </div>
                ))}
              </div>
              {notSubmittedAmbassadors.length === 0 && (
                <p className="text-text-muted text-center py-8">太棒了！所有人都已繳交</p>
              )}
            </div>
          </FadeIn>

          {/* Submitted */}
          <FadeIn delay={0.25}>
            <div className="bg-bg-card rounded-xl p-4 sm:p-6 shadow-elevation-1 border border-border">
              <h3 className="text-base sm:text-lg font-bold text-success mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                已繳交 ({submittedAmbassadors.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                {submittedAmbassadors.map((ambassador) => {
                  const submission = submissions.find((s) => s.ambassador_id === ambassador.ambassador_id);
                  return (
                    <div key={ambassador.id} className="bg-gradient-to-br from-success/10 to-success/5 border-2 border-success rounded-lg p-2 sm:p-3 text-center hover:shadow-elevation-2 transition-all relative group cursor-pointer">
                      <div className="text-xs font-bold text-success mb-1">#{ambassador.ambassador_id}</div>
                      <div className="text-sm font-medium text-success">{ambassador.name}</div>
                      {submission && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-bg-card text-text-primary text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-border shadow-lg">
                          {new Date(submission.submitted_at).toLocaleString('zh-TW')}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-bg-card border-r border-b border-border rotate-45 -mt-1" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {submittedAmbassadors.length === 0 && (
                <p className="text-text-muted text-center py-8">還沒有人繳交</p>
              )}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Floating submit button */}
      {mission.status === 'ongoing' && (
        <m.a
          href={tallyUrl}
          className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-full shadow-elevation-4 flex items-center gap-2 text-sm sm:text-base"
          whileHover={prefersReduced ? undefined : { scale: 1.05, boxShadow: '0 16px 32px -8px rgba(59, 130, 246, 0.3)' }}
          whileTap={prefersReduced ? undefined : { scale: 0.95 }}
          transition={spring.tactile}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>繳交任務</span>
        </m.a>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { m, AnimatePresence } from 'motion/react';
import { supabase } from '@/app/lib/supabase';
import { nunuEvents } from '@/app/data/nunu-events';
import { NunuEventRegistration, NunuEventCheckin } from '@/app/types/nunu';
import { AnimatedCounter, Badge } from '@/app/components/ui';
import { FadeIn, StaggerChildren, useReducedMotion } from '@/app/components/motion';
import { CelebrationOverlay, DarkModeToggle } from '@/app/components/operational';
import { spring } from '@/app/styles/tokens';

type FilterType = 'all' | 'checked_in' | 'not_checked_in';

export default function CheckinPage() {
  const params = useParams();
  const id = params.id as string;
  const event = nunuEvents.find((e) => e.id === id);
  const prefersReduced = useReducedMotion();

  const [registrations, setRegistrations] = useState<NunuEventRegistration[]>([]);
  const [checkins, setCheckins] = useState<NunuEventCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [celebration, setCelebration] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      const { data: regData, error: regError } = await supabase
        .from('nunu_event_registrations')
        .select('*')
        .eq('event_id', id)
        .order('registration_number', { ascending: true });

      if (regError) console.error('Error fetching registrations:', regError);
      else if (regData) setRegistrations(regData);

      const { data: checkinData, error: checkinError } = await supabase
        .from('nunu_event_checkins')
        .select('*')
        .eq('event_id', id);

      if (checkinError) console.error('Error fetching checkins:', checkinError);
      else if (checkinData) setCheckins(checkinData);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('checkins-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nunu_event_checkins' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  if (!event) notFound();

  const getCheckinStatus = (registrationId: string) => {
    return checkins.find((c) => c.registration_id === registrationId && c.status === 'checked_in');
  };

  const handleCheckin = async (registration: NunuEventRegistration) => {
    const existingCheckin = getCheckinStatus(registration.id);

    if (existingCheckin) {
      const { error } = await supabase
        .from('nunu_event_checkins')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', existingCheckin.id);

      if (error) {
        console.error('Error cancelling checkin:', error);
        alert('取消簽到失敗');
      }
    } else {
      const { error } = await supabase
        .from('nunu_event_checkins')
        .upsert({
          event_id: id,
          registration_id: registration.id,
          status: 'checked_in',
          checked_in_at: new Date().toISOString(),
        }, {
          onConflict: 'event_id,registration_id',
        });

      if (error) {
        console.error('Error checking in:', error);
        alert('簽到失敗');
      } else {
        setCelebration({ show: true, message: `${registration.chinese_name} 簽到成功！` });
      }
    }

    await fetchData();
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      searchQuery === '' ||
      reg.chinese_name.includes(searchQuery) ||
      reg.english_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isCheckedIn = !!getCheckinStatus(reg.id);
    if (filter === 'checked_in') return isCheckedIn;
    if (filter === 'not_checked_in') return !isCheckedIn;
    return true;
  });

  const checkedInCount = registrations.filter((reg) => getCheckinStatus(reg.id)).length;
  const notCheckedInCount = registrations.length - checkedInCount;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-border" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <div className="text-text-muted animate-pulse">載入中...</div>
      </div>
    );
  }

  const filterButtons = [
    { type: 'all' as const, count: registrations.length, label: '全部', activeClass: 'bg-text-primary text-white shadow-lg' },
    { type: 'checked_in' as const, count: checkedInCount, label: '已到', activeClass: 'bg-success text-white shadow-lg shadow-success/25' },
    { type: 'not_checked_in' as const, count: notCheckedInCount, label: '未到', activeClass: 'bg-error text-white shadow-lg shadow-error/25' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <FadeIn direction="down" offset={8}>
        <header className="bg-bg-card border-b border-border sticky top-0 z-40">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/nunu/events/${id}`}
                className="text-text-muted hover:text-text-secondary hover:-translate-x-1 transition-all duration-200"
              >
                ←
              </Link>
              <div>
                <p className="text-[10px] text-success tracking-widest uppercase font-medium">Check-in</p>
                <h1 className="text-base font-semibold text-text-primary">簽到點名</h1>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </header>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.05}>
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            {filterButtons.map((btn) => (
              <button
                key={btn.type}
                onClick={() => setFilter(btn.type)}
                className={`p-3 rounded-xl text-center transition-all ${
                  filter === btn.type ? btn.activeClass : 'bg-bg-card border border-border text-text-secondary hover:border-border'
                }`}
              >
                <div className="text-2xl font-bold tabular-nums">
                  <AnimatedCounter value={btn.count} />
                </div>
                <div className="text-xs opacity-70">{btn.label}</div>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="搜尋姓名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-primary transition-all"
            />
          </div>
        </div>
      </FadeIn>

      {/* List */}
      <div className="max-w-lg mx-auto px-4 pb-8">
        <StaggerChildren className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredRegistrations.map((reg) => {
              const checkin = getCheckinStatus(reg.id);
              const isCheckedIn = !!checkin;

              return (
                <StaggerChildren.Item key={reg.id}>
                  <m.button
                    layout={!prefersReduced}
                    onClick={() => handleCheckin(reg)}
                    whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                    transition={spring.tactile}
                    className={`w-full p-4 rounded-xl text-left transition-colors ${
                      isCheckedIn
                        ? 'bg-success-light border-2 border-success/20'
                        : 'bg-bg-card border border-border hover:border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                            isCheckedIn
                              ? 'bg-success text-white'
                              : 'bg-bg-secondary text-text-secondary'
                          }`}
                        >
                          {String(reg.registration_number).padStart(2, '0')}
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {reg.chinese_name}
                            <span className="text-text-muted font-normal ml-2">{reg.english_name}</span>
                          </div>
                          {isCheckedIn && checkin && (
                            <div className="text-xs text-success mt-0.5">
                              {formatTime(checkin.checked_in_at)} 簽到
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isCheckedIn ? (
                          <m.div
                            initial={prefersReduced ? undefined : { scale: 0 }}
                            animate={prefersReduced ? undefined : { scale: 1 }}
                            transition={spring.playful}
                            className="w-8 h-8 bg-success rounded-full flex items-center justify-center text-white"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </m.div>
                        ) : (
                          <div className="w-8 h-8 border-2 border-border rounded-full" />
                        )}
                      </div>
                    </div>
                  </m.button>
                </StaggerChildren.Item>
              );
            })}
          </AnimatePresence>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              {searchQuery ? '找不到符合的人' : '沒有報名資料'}
            </div>
          )}
        </StaggerChildren>
      </div>

      {/* Celebration */}
      <CelebrationOverlay
        show={celebration.show}
        message={celebration.message}
        onComplete={() => setCelebration({ show: false, message: '' })}
      />
    </div>
  );
}

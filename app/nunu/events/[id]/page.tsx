'use client';

import { useEffect, useState, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { nunuEvents } from '@/app/data/nunu-events';
import { NunuEventRegistration } from '@/app/types/nunu';
import { FadeIn } from '@/app/components/motion';
import { EventMetrics, TeamRoster, SizeDistribution, EventInfoCards, RegistrationModal } from './components';

export default function NunuEventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const event = nunuEvents.find((e) => e.id === id);

  const [registrations, setRegistrations] = useState<NunuEventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('nunu_event_registrations')
        .select('*')
        .eq('event_id', id)
        .order('registration_number', { ascending: true });

      if (error) console.error('Error fetching registrations:', error);
      else if (data) setRegistrations(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRegistrations();

    const channel = supabase
      .channel('nunu-registrations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nunu_event_registrations' }, () => {
        fetchRegistrations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchRegistrations]);

  if (!event) notFound();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-border" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-text-muted animate-pulse">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <FadeIn direction="down" offset={8}>
        <div className="bg-bg-card border-b border-border sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/nunu" className="text-text-muted hover:text-text-primary hover:-translate-x-1 transition-all duration-200">←</Link>
              <div>
                <p className="text-[10px] text-text-muted tracking-widest uppercase">Event Dashboard</p>
                <h1 className="text-base font-semibold text-text-primary">{event.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/nunu/events/${id}/run`} className="px-4 py-2 bg-error-light hover:bg-error text-error hover:text-white text-sm font-medium rounded-lg border border-error/20 hover:border-error transition-all hover:shadow-lg hover:shadow-error/25 hover:-translate-y-0.5">執行</Link>
              <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5">努努參戰</button>
            </div>
          </div>
        </div>
      </FadeIn>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-12 gap-4">
          <EventMetrics event={event} registrations={registrations} />
          <TeamRoster registrations={registrations} />
          <SizeDistribution registrations={registrations} />
          <EventInfoCards registrations={registrations} />
        </div>
      </div>
      <RegistrationModal isOpen={showForm} onClose={() => setShowForm(false)} eventId={id} registrations={registrations} onSuccess={fetchRegistrations} />
    </div>
  );
}

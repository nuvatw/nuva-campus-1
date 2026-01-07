'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { nunuEvents } from '@/app/data/nunu-events';
import { NunuEventRegistration, NunuEventCheckin } from '@/app/types/nunu';

type FilterType = 'all' | 'checked_in' | 'not_checked_in';

export default function CheckinPage() {
  const params = useParams();
  const id = params.id as string;
  const event = nunuEvents.find((e) => e.id === id);

  const [registrations, setRegistrations] = useState<NunuEventRegistration[]>([]);
  const [checkins, setCheckins] = useState<NunuEventCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      // Fetch registrations
      const { data: regData, error: regError } = await supabase
        .from('nunu_event_registrations')
        .select('*')
        .eq('event_id', id)
        .order('registration_number', { ascending: true });

      if (regError) {
        console.error('Error fetching registrations:', regError);
      } else if (regData) {
        setRegistrations(regData);
      }

      // Fetch checkins
      const { data: checkinData, error: checkinError } = await supabase
        .from('nunu_event_checkins')
        .select('*')
        .eq('event_id', id);

      if (checkinError) {
        console.error('Error fetching checkins:', checkinError);
      } else if (checkinData) {
        setCheckins(checkinData);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();

    // Real-time subscription for checkins
    const channel = supabase
      .channel('checkins-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nunu_event_checkins' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  if (!event) {
    notFound();
  }

  const getCheckinStatus = (registrationId: string) => {
    const checkin = checkins.find((c) => c.registration_id === registrationId && c.status === 'checked_in');
    return checkin;
  };

  const handleCheckin = async (registration: NunuEventRegistration) => {
    const existingCheckin = getCheckinStatus(registration.id);

    if (existingCheckin) {
      // Cancel check-in
      const { error } = await supabase
        .from('nunu_event_checkins')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', existingCheckin.id);

      if (error) {
        console.error('Error cancelling checkin:', error);
        alert('取消簽到失敗');
      }
    } else {
      // Check in
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
      }
    }

    await fetchData();
  };

  // Filter and search
  const filteredRegistrations = registrations.filter((reg) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      reg.chinese_name.includes(searchQuery) ||
      reg.english_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    const isCheckedIn = !!getCheckinStatus(reg.id);
    if (filter === 'checked_in') return isCheckedIn;
    if (filter === 'not_checked_in') return !isCheckedIn;
    return true;
  });

  const checkedInCount = registrations.filter((reg) => getCheckinStatus(reg.id)).length;
  const notCheckedInCount = registrations.length - checkedInCount;

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
        </div>
        <div className="text-slate-400 animate-pulse">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/nunu/events/${id}`}
              className="text-slate-400 hover:text-slate-600 hover:-translate-x-1 transition-all duration-200"
            >
              ←
            </Link>
            <div>
              <p className="text-[10px] text-emerald-500 tracking-widest uppercase font-medium">Check-in</p>
              <h1 className="text-base font-semibold text-slate-800">簽到點名</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`p-3 rounded-xl text-center transition-all ${
              filter === 'all'
                ? 'bg-slate-800 text-white shadow-lg'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="text-2xl font-bold">{registrations.length}</div>
            <div className="text-xs opacity-70">全部</div>
          </button>
          <button
            onClick={() => setFilter('checked_in')}
            className={`p-3 rounded-xl text-center transition-all ${
              filter === 'checked_in'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
            }`}
          >
            <div className="text-2xl font-bold">{checkedInCount}</div>
            <div className="text-xs opacity-70">已到</div>
          </button>
          <button
            onClick={() => setFilter('not_checked_in')}
            className={`p-3 rounded-xl text-center transition-all ${
              filter === 'not_checked_in'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300'
            }`}
          >
            <div className="text-2xl font-bold">{notCheckedInCount}</div>
            <div className="text-xs opacity-70">未到</div>
          </button>
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="搜尋姓名..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-800 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="space-y-2">
          {filteredRegistrations.map((reg) => {
            const checkin = getCheckinStatus(reg.id);
            const isCheckedIn = !!checkin;

            return (
              <button
                key={reg.id}
                onClick={() => handleCheckin(reg)}
                className={`w-full p-4 rounded-xl text-left transition-all active:scale-[0.98] ${
                  isCheckedIn
                    ? 'bg-emerald-50 border-2 border-emerald-200'
                    : 'bg-white border border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCheckedIn
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {String(reg.registration_number).padStart(2, '0')}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {reg.chinese_name}
                        <span className="text-slate-400 font-normal ml-2">{reg.english_name}</span>
                      </div>
                      {isCheckedIn && checkin && (
                        <div className="text-xs text-emerald-600 mt-0.5">
                          {formatTime(checkin.checked_in_at)} 簽到
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {isCheckedIn ? (
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                        ✓
                      </div>
                    ) : (
                      <div className="w-8 h-8 border-2 border-slate-200 rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              {searchQuery ? '找不到符合的人' : '沒有報名資料'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

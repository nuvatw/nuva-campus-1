'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { supabase } from '@/app/lib/supabase';
import { workshops } from '@/app/data/workshops';
import { Ambassador } from '@/app/types/ambassador';
import { EventRegistration } from '@/app/types/workshop';

export default function WorkshopDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
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

        if (ambassadorData) {
          setAmbassadors(ambassadorData);
        }

        const eventId = id.toLowerCase();
        const { data: registrationData } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('event_id', eventId)
          .order('registered_at', { ascending: true });

        if (registrationData) {
          setRegistrations(registrationData);
        }
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
  const registeredParticipantIds = ambassadorRegistrations.map((r) => r.ambassador_id);
  const registeredAmbassadors = ambassadors.filter((a) => registeredParticipantIds.includes(a.ambassador_id));
  const notRegisteredAmbassadors = ambassadors.filter((a) => !registeredParticipantIds.includes(a.ambassador_id));

  const totalCount = registrations.length;
  const offlineCount = registrations.filter((r) => r.attendance_mode === 'offline').length;
  const onlineCount = registrations.filter((r) => r.attendance_mode === 'online').length;
  const lunchBoxCount = registrations.filter((r) => r.lunch_box_required).length;

  const tallyUrl = workshop.tallyFormId ? `#tally-open=${workshop.tallyFormId}&tally-emoji-text=👋&tally-emoji-animation=wave` : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script src="https://tally.so/widgets/embed.js" strategy="afterInteractive" />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              ← 返回首頁
            </Link>
            <div className="w-px h-6 bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-800">{workshop.title}</h1>
            <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
              {workshop.type === 'offline' ? '📍 實體工作坊' : '💻 線上直播'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">工作坊資訊</h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <span>{new Date(workshop.date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">🕐</span>
                <span>{workshop.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <span>{workshop.location}</span>
              </div>
              {workshop.description && (
                <div className="flex items-start gap-3 pt-2">
                  <span className="text-xl">📝</span>
                  <span>{workshop.description}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-primary-light rounded-xl p-4 shadow-sm text-center border-2 border-primary">
              <div className="text-3xl font-bold text-primary">{totalCount}</div>
              <div className="text-sm text-primary mt-1">總報名人數</div>
            </div>
            <div className="bg-success-light rounded-xl p-4 shadow-sm text-center border-2 border-success">
              <div className="text-3xl font-bold text-success">{offlineCount}</div>
              <div className="text-sm text-success mt-1">實體參與</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 shadow-sm text-center border-2 border-blue-400">
              <div className="text-3xl font-bold text-blue-600">{onlineCount}</div>
              <div className="text-sm text-blue-600 mt-1">線上參與</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 shadow-sm text-center border-2 border-amber-400">
              <div className="text-3xl font-bold text-amber-600">{lunchBoxCount}</div>
              <div className="text-sm text-amber-600 mt-1">訂便當 🍱</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-success-light rounded-xl p-4 border-2 border-success">
              <div className="text-3xl font-bold text-success">{ambassadorRegistrations.length}</div>
              <div className="text-sm text-success mt-1">校園大使報名</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-300">
              <div className="text-3xl font-bold text-gray-600">{nunuRegistrations.length}</div>
              <div className="text-sm text-gray-500 mt-1">努努報名</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-4">⏳ 尚未報名的校園大使 ({notRegisteredAmbassadors.length})</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {notRegisteredAmbassadors.map((ambassador) => (
                <div key={ambassador.id} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                  <div className="text-xs font-bold text-gray-500 mb-1">#{ambassador.ambassador_id}</div>
                  <div className="text-sm font-medium text-gray-700">{ambassador.name}</div>
                </div>
              ))}
            </div>
            {notRegisteredAmbassadors.length === 0 && (
              <p className="text-gray-400 text-center py-8">太棒了！所有校園大使都已報名 🎉</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-success">✓ 已報名的校園大使 ({registeredAmbassadors.length})</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-success rounded border border-success"></span>
                  <span className="text-gray-500">實體</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-100 rounded border border-blue-400"></span>
                  <span className="text-gray-500">線上</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {registeredAmbassadors.map((ambassador) => {
                const reg = ambassadorRegistrations.find((r) => r.ambassador_id === ambassador.ambassador_id);
                const isOffline = reg?.attendance_mode === 'offline';
                const needLunch = reg?.lunch_box_required;
                return (
                  <div 
                    key={ambassador.id} 
                    className={`
                      border-2 rounded-lg p-3 text-center transition-all cursor-pointer group relative
                      ${isOffline 
                        ? 'bg-success-light border-success hover:shadow-lg hover:scale-105' 
                        : 'bg-blue-50 border-blue-400 hover:shadow-lg hover:scale-105'
                      }
                    `}
                  >
                    <div className={`text-xs font-bold mb-1 ${isOffline ? 'text-success' : 'text-blue-600'}`}>
                      #{ambassador.ambassador_id}
                    </div>
                    <div className={`text-sm font-medium ${isOffline ? 'text-success' : 'text-blue-700'}`}>
                      {ambassador.name}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {needLunch ? '🍱 需要便當' : '不需要便當'}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1"></div>
                    </div>
                  </div>
                );
              })}
            </div>
            {registeredAmbassadors.length === 0 && (
              <p className="text-gray-400 text-center py-8">還沒有校園大使報名</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-600">👥 努努報名名單 ({nunuRegistrations.length})</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-success rounded border border-success"></span>
                  <span className="text-gray-500">實體</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-100 rounded border border-blue-400"></span>
                  <span className="text-gray-500">線上</span>
                </div>
              </div>
            </div>
            {nunuRegistrations.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {nunuRegistrations.map((reg) => {
                  const isOffline = reg.attendance_mode === 'offline';
                  const needLunch = reg.lunch_box_required;
                  return (
                    <div 
                      key={reg.id} 
                      className={`
                        border-2 rounded-lg p-3 text-center transition-all cursor-pointer group relative
                        ${isOffline 
                          ? 'bg-success-light border-success hover:shadow-lg hover:scale-105' 
                          : 'bg-blue-50 border-blue-400 hover:shadow-lg hover:scale-105'
                        }
                      `}
                    >
                      <div className={`text-sm font-medium ${isOffline ? 'text-success' : 'text-blue-700'}`}>
                        {reg.participant_name}
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {needLunch ? '🍱 需要便當' : '不需要便當'}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">還沒有努努報名</p>
            )}
          </div>
        </div>
      </div>

      {workshop.tallyFormId && (
        <a href={tallyUrl} className="fixed bottom-8 right-8 z-50 px-6 py-4 bg-primary text-white font-bold rounded-full shadow-2xl hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2">
          <span className="text-xl">📝</span>
          <span>立即報名</span>
        </a>
      )}
    </div>
  );
}
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

  // 分類資料
  const ambassadorRegistrations = registrations.filter((r) => r.member_type === 'ambassador');
  const nunuRegistrations = registrations.filter((r) => r.member_type === 'nunu');
  
  const registeredAmbassadorIds = ambassadorRegistrations.map((r) => r.ambassador_id);
  const notRegisteredAmbassadors = ambassadors.filter((a) => !registeredAmbassadorIds.includes(a.ambassador_id));
  
  // 實體參與 - 校園大使按編號排序，努努按姓名排序
  const offlineAmbassadors = ambassadorRegistrations
    .filter((r) => r.attendance_mode === 'offline')
    .sort((a, b) => parseInt(a.ambassador_id || '0') - parseInt(b.ambassador_id || '0'));
  const offlineNunu = nunuRegistrations
    .filter((r) => r.attendance_mode === 'offline')
    .sort((a, b) => a.participant_name.localeCompare(b.participant_name, 'zh-TW'));
  
  // 線上參與 - 校園大使按編號排序，努努按姓名排序
  const onlineAmbassadors = ambassadorRegistrations
    .filter((r) => r.attendance_mode === 'online')
    .sort((a, b) => parseInt(a.ambassador_id || '0') - parseInt(b.ambassador_id || '0'));
  const onlineNunu = nunuRegistrations
    .filter((r) => r.attendance_mode === 'online')
    .sort((a, b) => a.participant_name.localeCompare(b.participant_name, 'zh-TW'));

  // 統計
  const totalCount = registrations.length;
  const offlineCount = offlineAmbassadors.length + offlineNunu.length;
  const onlineCount = onlineAmbassadors.length + onlineNunu.length;
  const lunchBoxCount = registrations.filter((r) => r.lunch_box_required).length;

  // 圓餅圖計算
  const offlinePercent = totalCount > 0 ? (offlineCount / totalCount) * 100 : 0;
  const onlinePercent = totalCount > 0 ? (onlineCount / totalCount) * 100 : 0;

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

      {/* Header - 手機版優化 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
            <Link href="/ambassador" className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base whitespace-nowrap">
              ← 返回
            </Link>
            <div className="w-px h-4 sm:h-6 bg-gray-300" />
            <span className="px-2 py-1 bg-primary text-white text-xs rounded-full whitespace-nowrap">
              {workshop.type === 'offline' ? '📍 實體' : '💻 線上'}
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800 sm:mt-0">{workshop.title}</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* 工作坊資訊 + 圓餅圖 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">工作坊資訊</h3>
              <div className="space-y-3 text-gray-600 text-sm sm:text-base">
                <div className="flex items-center gap-3">
                  <span className="text-lg sm:text-xl">📅</span>
                  <span>{new Date(workshop.date).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}</span>
                </div>
                {workshop.checkinTime && (
                  <div className="flex items-center gap-3">
                    <span className="text-lg sm:text-xl">✅</span>
                    <span>報到時間：{workshop.checkinTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-lg sm:text-xl">🕐</span>
                  <span>{workshop.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg sm:text-xl">📍</span>
                  <span>
                    {workshop.location}
                    {workshop.locationUrl && (
                      <a
                        href={workshop.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline"
                      >
                        (Google Map)
                      </a>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 圓餅圖 */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 text-center">報名統計</h3>
              <div className="flex items-center justify-center gap-6 sm:gap-8">
                {/* 圓餅圖 */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                  <svg viewBox="0 0 36 36" className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle 
                      cx="18" cy="18" r="15.9" 
                      fill="none" 
                      stroke="#22c55e" 
                      strokeWidth="3"
                      strokeDasharray={`${offlinePercent} ${100 - offlinePercent}`}
                      strokeDashoffset="0"
                    />
                    <circle 
                      cx="18" cy="18" r="15.9" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="3"
                      strokeDasharray={`${onlinePercent} ${100 - onlinePercent}`}
                      strokeDashoffset={`${-offlinePercent}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold text-gray-800">{totalCount}</span>
                    <span className="text-xs text-gray-500">總報名</span>
                  </div>
                </div>

                {/* 圖例 */}
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-success rounded-full"></div>
                    <span className="text-gray-600">實體 {offlineCount} 人</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">線上 {onlineCount} 人</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">🍱</span>
                    <span className="text-gray-600">便當 {lunchBoxCount} 份</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 活動細流 */}
          {workshop.schedule && workshop.schedule.length > 0 && (
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">📋 活動細流</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 sm:px-4 text-gray-600 font-semibold whitespace-nowrap">時段</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-gray-600 font-semibold">單元名稱</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-gray-600 font-semibold hidden sm:table-cell">內容重點</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workshop.schedule.map((item, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${item.title === '午休' ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="py-3 px-2 sm:px-4 text-gray-500 whitespace-nowrap font-mono text-xs sm:text-sm">
                          {item.time}
                        </td>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-800">
                          {item.title}
                          {/* 手機版顯示內容重點 */}
                          <div className="sm:hidden text-xs text-gray-500 mt-1">{item.description}</div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-gray-600 hidden sm:table-cell">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 尚未報名 */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-4">⏳ 尚未報名 ({notRegisteredAmbassadors.length})</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
              {notRegisteredAmbassadors.map((ambassador) => (
                <div key={ambassador.id} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-1.5 sm:p-2 text-center hover:shadow-md transition-all">
                  <div className="text-[10px] sm:text-xs font-bold text-gray-500">#{ambassador.ambassador_id}</div>
                  <div className="text-[10px] sm:text-xs font-medium text-gray-700 truncate">{ambassador.name}</div>
                </div>
              ))}
            </div>
            {notRegisteredAmbassadors.length === 0 && (
              <p className="text-gray-400 text-center py-8">太棒了！所有校園大使都已報名 🎉</p>
            )}
          </div>

          {/* 實體參與 */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h3 className="text-base sm:text-lg font-bold text-success mb-4">📍 實體參與 ({offlineAmbassadors.length + offlineNunu.length})</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
              {offlineAmbassadors.map((reg) => {
                const ambassador = ambassadors.find((a) => a.ambassador_id === reg.ambassador_id);
                return (
                  <div key={reg.id} className="bg-success-light border-2 border-success rounded-lg p-1.5 sm:p-2 text-center hover:shadow-md transition-all relative">
                    {reg.lunch_box_required && (
                      <div className="absolute -top-1 -right-1 text-xs sm:text-sm">🍱</div>
                    )}
                    <div className="text-[10px] sm:text-xs font-bold text-success">#{reg.ambassador_id}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-success truncate">{ambassador?.name || reg.participant_name}</div>
                  </div>
                );
              })}
              {offlineNunu.map((reg) => (
                <div key={reg.id} className="bg-success-light border-2 border-success rounded-lg p-1.5 sm:p-2 text-center hover:shadow-md transition-all relative">
                  {reg.lunch_box_required && (
                    <div className="absolute -top-1 -right-1 text-xs sm:text-sm">🍱</div>
                  )}
                  <div className="text-[10px] sm:text-xs font-bold text-success">努努</div>
                  <div className="text-[10px] sm:text-xs font-medium text-success truncate">{reg.participant_name}</div>
                </div>
              ))}
            </div>
            {offlineAmbassadors.length + offlineNunu.length === 0 && (
              <p className="text-gray-400 text-center py-8">還沒有人選擇實體參與</p>
            )}
          </div>

          {/* 線上參與 */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h3 className="text-base sm:text-lg font-bold text-blue-600 mb-4">💻 線上參與 ({onlineAmbassadors.length + onlineNunu.length})</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
              {onlineAmbassadors.map((reg) => {
                const ambassador = ambassadors.find((a) => a.ambassador_id === reg.ambassador_id);
                return (
                  <div key={reg.id} className="bg-blue-50 border-2 border-blue-400 rounded-lg p-1.5 sm:p-2 text-center hover:shadow-md transition-all">
                    <div className="text-[10px] sm:text-xs font-bold text-blue-600">#{reg.ambassador_id}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-blue-700 truncate">{ambassador?.name || reg.participant_name}</div>
                  </div>
                );
              })}
              {onlineNunu.map((reg) => (
                <div key={reg.id} className="bg-blue-50 border-2 border-blue-400 rounded-lg p-1.5 sm:p-2 text-center hover:shadow-md transition-all">
                  <div className="text-[10px] sm:text-xs font-bold text-blue-600">努努</div>
                  <div className="text-[10px] sm:text-xs font-medium text-blue-700 truncate">{reg.participant_name}</div>
                </div>
              ))}
            </div>
            {onlineAmbassadors.length + onlineNunu.length === 0 && (
              <p className="text-gray-400 text-center py-8">還沒有人選擇線上參與</p>
            )}
          </div>
        </div>
      </div>

      {workshop.tallyFormId && (
        <a href={tallyUrl} className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-primary text-white font-bold rounded-full shadow-2xl hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2 text-sm sm:text-base">
          <span className="text-lg sm:text-xl">📝</span>
          <span>立即報名</span>
        </a>
      )}
    </div>
  );
}
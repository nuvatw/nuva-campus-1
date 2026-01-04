'use client';

import { useEffect, useState, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { nunuEvents } from '@/app/data/nunu-events';
import { NunuEventRegistration, SHIRT_SIZES, ShirtSize } from '@/app/types/nunu';

// Countdown hook
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isExpired: false,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

export default function NunuEventDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [registrations, setRegistrations] = useState<NunuEventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    chinese_name: '',
    english_name: '',
    shirt_size: '' as ShirtSize | '',
    dietary_restrictions: '',
    picky_eating: '',
  });

  const event = nunuEvents.find((e) => e.id === id);

  // Pre-meeting countdown
  const preMeetingCountdown = useCountdown(
    event?.preMeeting ? `${event.preMeeting.date}T${event.preMeeting.startTime}:00+08:00` : ''
  );

  const fetchRegistrations = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('nunu_event_registrations')
        .select('*')
        .eq('event_id', id)
        .order('registration_number', { ascending: true });

      if (error) {
        console.error('Error fetching registrations:', error);
      } else if (data) {
        setRegistrations(data);
      }
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nunu_event_registrations' },
        () => {
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRegistrations]);

  if (!event) {
    notFound();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.chinese_name || !formData.english_name || !formData.shirt_size) {
      alert('請填寫必填欄位');
      return;
    }

    setSubmitting(true);

    try {
      const existingReg = registrations.find(
        (r) => r.chinese_name === formData.chinese_name
      );

      if (existingReg) {
        const { error } = await supabase
          .from('nunu_event_registrations')
          .update({
            english_name: formData.english_name,
            shirt_size: formData.shirt_size,
            dietary_restrictions: formData.dietary_restrictions || null,
            picky_eating: formData.picky_eating || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReg.id);

        if (error) throw error;
      } else {
        const maxNumber = registrations.length > 0
          ? Math.max(...registrations.map((r) => r.registration_number))
          : 0;

        const { error } = await supabase
          .from('nunu_event_registrations')
          .insert({
            event_id: id,
            registration_number: maxNumber + 1,
            chinese_name: formData.chinese_name,
            english_name: formData.english_name,
            shirt_size: formData.shirt_size,
            dietary_restrictions: formData.dietary_restrictions || null,
            picky_eating: formData.picky_eating || null,
          });

        if (error) throw error;
      }

      setFormData({
        chinese_name: '',
        english_name: '',
        shirt_size: '',
        dietary_restrictions: '',
        picky_eating: '',
      });
      setShowForm(false);
      await fetchRegistrations();
    } catch (err) {
      console.error('Submit error:', err);
      alert('提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const dietaryList = registrations.filter((r) => r.dietary_restrictions);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white/60">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/nunu"
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              ← 返回
            </Link>
            <div className="w-px h-4 bg-white/30" />
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium">
              Nunu 活動
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {event.title}
          </h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="space-y-6">

          {/* Google Meet 行前會議 */}
          {event.preMeeting && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-1">
              <div className="bg-slate-900/90 backdrop-blur rounded-xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📹</span>
                      <h3 className="text-lg font-bold text-white">行前線上會議</h3>
                    </div>
                    <div className="space-y-1 text-white/80 text-sm">
                      <p>
                        📅 {new Date(event.preMeeting.date).toLocaleDateString('zh-TW', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </p>
                      <p>🕘 {event.preMeeting.startTime} ~ {event.preMeeting.endTime}</p>
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="flex flex-col items-center sm:items-end gap-3">
                    {!preMeetingCountdown.isExpired ? (
                      <>
                        <div className="flex gap-2 text-center">
                          <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 min-w-[50px]">
                            <div className="text-2xl font-bold text-white">{preMeetingCountdown.days}</div>
                            <div className="text-[10px] text-white/60">天</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 min-w-[50px]">
                            <div className="text-2xl font-bold text-white">{preMeetingCountdown.hours}</div>
                            <div className="text-[10px] text-white/60">時</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 min-w-[50px]">
                            <div className="text-2xl font-bold text-white">{preMeetingCountdown.minutes}</div>
                            <div className="text-[10px] text-white/60">分</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 min-w-[50px]">
                            <div className="text-2xl font-bold text-cyan-400">{preMeetingCountdown.seconds}</div>
                            <div className="text-[10px] text-white/60">秒</div>
                          </div>
                        </div>
                        <a
                          href={event.preMeeting.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-medium rounded-full transition-all hover:scale-105 text-sm flex items-center gap-2"
                        >
                          <span>加入 Google Meet</span>
                          <span>→</span>
                        </a>
                      </>
                    ) : (
                      <a
                        href={event.preMeeting.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-full transition-all hover:scale-105 animate-pulse flex items-center gap-2"
                      >
                        <span className="text-lg">🔴</span>
                        <span>會議進行中，立即加入！</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Event Info + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-sm">📋</span>
                活動資訊
              </h3>
              <div className="space-y-3 text-white/80 text-sm sm:text-base">
                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-lg">📅</span>
                  <span>
                    {new Date(event.date).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-lg">🕐</span>
                  <span>{event.startTime} ~ {event.endTime}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-lg">📍</span>
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg px-3 py-2">
                  <span className="text-lg">🚩</span>
                  <span className="font-medium text-amber-300">
                    集合時間：{event.meetingTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-sm">📊</span>
                報名統計
              </h3>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {registrations.length}
                  </div>
                  <div className="text-white/60 mt-2 text-sm">位努努已報名</div>
                </div>
              </div>
            </div>
          </div>

          {/* Registered List */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-sm">🎯</span>
              已報名 ({registrations.length})
            </h3>
            {registrations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 text-center hover:scale-105 transition-all cursor-default"
                  >
                    <div className="text-xs font-bold text-green-400 mb-1">
                      #{String(reg.registration_number).padStart(2, '0')}
                    </div>
                    <div className="text-sm font-medium text-white truncate">
                      {reg.english_name}
                    </div>
                    <div className="text-xs text-white/50 mt-1 bg-white/10 rounded px-2 py-0.5 inline-block">
                      {reg.shirt_size}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🙋</div>
                <p className="text-white/50">還沒有人報名，快來成為第一個！</p>
              </div>
            )}
          </div>

          {/* 服裝儀容 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center text-sm">👔</span>
              服裝儀容
            </h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <span>👖</span> 下身穿著
                </h4>
                <p className="text-white/70 text-sm">
                  請穿著<span className="text-indigo-300 font-medium">黑色長褲或長裙</span>（如果真的沒有黑色，就穿深色）
                </p>
              </div>
              <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <span>👟</span> 鞋子
                </h4>
                <p className="text-white/70 text-sm">
                  <span className="text-red-400 font-medium">不可以露出腳趾頭</span>（我們會提供襪子）
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <span>👕</span> 我們提供
                </h4>
                <p className="text-white/70 text-sm">
                  衣服（短袖）、襪子
                </p>
              </div>
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <span>🧥</span> 保暖建議
                </h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• 室內怕冷的人，裡面可以多穿一件<span className="text-amber-300">薄長袖</span></li>
                  <li>• 晚上有<span className="text-amber-300">戶外野餐</span>，請準備防風措施</li>
                  <li>• 建議攜帶：防風外套、毛帽，以免著涼</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 上哲點餐中 */}
          {dietaryList.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-sm">🍽️</span>
                上哲點餐中
              </h3>
              <div className="space-y-2">
                {dietaryList.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex flex-wrap items-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl px-4 py-3"
                  >
                    <span className="font-medium text-amber-300">
                      {reg.english_name}
                    </span>
                    <span className="text-white/40">→</span>
                    <span className="text-white/80 bg-red-500/20 px-2 py-0.5 rounded text-sm">
                      不能吃：{reg.dietary_restrictions}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-full shadow-2xl shadow-purple-500/30 transition-all hover:scale-110 flex items-center gap-2 text-sm sm:text-base"
      >
        <span className="text-lg sm:text-xl">🙋</span>
        <span>努努參戰</span>
      </button>

      {/* Registration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🙋</span> 努努參戰表單
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white/50 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    中文姓名 <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.chinese_name}
                    onChange={(e) =>
                      setFormData({ ...formData, chinese_name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white placeholder-white/30 transition-all"
                    placeholder="王小明"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    英文姓名 <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.english_name}
                    onChange={(e) =>
                      setFormData({ ...formData, english_name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white placeholder-white/30 transition-all"
                    placeholder="Xiao Ming Wang"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    衣服尺寸 <span className="text-pink-400">*</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {SHIRT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, shirt_size: size })}
                        className={`py-2.5 rounded-xl font-medium transition-all ${
                          formData.shirt_size === size
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    飲食禁忌（不能吃）
                  </label>
                  <input
                    type="text"
                    value={formData.dietary_restrictions}
                    onChange={(e) =>
                      setFormData({ ...formData, dietary_restrictions: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white placeholder-white/30 transition-all"
                    placeholder="如：海鮮、牛肉、花生過敏"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    挑食（不愛吃）
                  </label>
                  <input
                    type="text"
                    value={formData.picky_eating}
                    onChange={(e) =>
                      setFormData({ ...formData, picky_eating: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-white placeholder-white/30 transition-all"
                    placeholder="如：香菜、茄子、青椒"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-purple-500/30"
                >
                  {submitting ? '送出中...' : '送出報名'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

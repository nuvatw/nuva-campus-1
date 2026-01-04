'use client';

import { useEffect, useState, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { nunuEvents } from '@/app/data/nunu-events';
import { NunuEventRegistration, SHIRT_SIZES, ShirtSize } from '@/app/types/nunu';

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

  // Shirt size statistics
  const sizeStats = SHIRT_SIZES.reduce((acc, size) => {
    acc[size] = registrations.filter((r) => r.shirt_size === size).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/nunu"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ←
            </Link>
            <div>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase">Event Dashboard</p>
              <h1 className="text-base font-semibold text-slate-800">{event.title}</h1>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-0.5"
          >
            努努參戰
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Bento Grid Layout - F-Pattern: Important info top-left */}
        <div className="grid grid-cols-12 gap-4">

          {/* Row 1: Key Metrics (Top-left priority) */}

          {/* Pre-meeting Countdown - Most important, top-left */}
          {event.preMeeting && (
            <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] text-sky-500 tracking-widest uppercase font-medium">Pre-meeting</p>
                  <h3 className="text-lg font-semibold text-slate-800 mt-1">行前線上會議</h3>
                </div>
                <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                  <span className="text-lg">📹</span>
                </div>
              </div>

              <p className="text-sm text-slate-500 mb-4">
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
                      <div key={i} className={`text-center px-3 py-2 rounded-lg ${item.highlight ? 'bg-sky-50' : 'bg-slate-50'}`}>
                        <div className={`text-xl font-semibold ${item.highlight ? 'text-sky-600' : 'text-slate-700'}`}>
                          {String(item.value).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] text-slate-400">{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <a
                    href={event.preMeeting.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-100 hover:bg-sky-500 text-slate-600 hover:text-white text-sm rounded-lg transition-all hover:shadow-lg"
                  >
                    加入會議 →
                  </a>
                </div>
              ) : (
                <a
                  href={event.preMeeting.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-all animate-pulse"
                >
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  會議進行中
                </a>
              )}
            </div>
          )}

          {/* Registration Count - Key metric */}
          <div className={`${event.preMeeting ? 'col-span-6 lg:col-span-3' : 'col-span-6 lg:col-span-4'} bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group`}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] text-emerald-500 tracking-widest uppercase font-medium">Participants</p>
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <span>👥</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-slate-800 mb-1">{registrations.length}</div>
            <p className="text-sm text-slate-400">位努努已報名</p>
          </div>

          {/* Event Date - Secondary info */}
          <div className={`${event.preMeeting ? 'col-span-6 lg:col-span-4' : 'col-span-6 lg:col-span-4'} bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 group`}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] text-amber-500 tracking-widest uppercase font-medium">Event Date</p>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <span>📅</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {new Date(event.date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
            </div>
            <p className="text-sm text-slate-400">
              {event.startTime} · {event.location}
            </p>
            <div className="mt-3 inline-block px-2 py-1 bg-amber-50 text-amber-600 text-xs rounded">
              集合 {event.meetingTime}
            </div>
          </div>

          {/* Row 2: Participant List - Main content area */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] text-slate-400 tracking-widest uppercase font-medium">Team Roster</p>
                <h3 className="text-base font-semibold text-slate-800 mt-0.5">已報名成員</h3>
              </div>
              <span className="text-sm text-slate-400">{registrations.length} 人</span>
            </div>

            {registrations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="group/card bg-slate-50 hover:bg-sky-50 border border-transparent hover:border-sky-200 rounded-xl p-3 transition-all duration-200 cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white group-hover/card:bg-sky-100 rounded-lg flex items-center justify-center text-xs font-bold text-sky-500 transition-colors shadow-sm">
                        {String(reg.registration_number).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{reg.english_name}</p>
                        <p className="text-[10px] text-slate-400">{reg.shirt_size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <div className="text-3xl mb-2">🙋</div>
                <p className="text-sm">還沒有人報名，快來成為第一個！</p>
              </div>
            )}
          </div>

          {/* Shirt Size Stats - Right sidebar */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="mb-4">
              <p className="text-[10px] text-slate-400 tracking-widest uppercase font-medium">Size Distribution</p>
              <h3 className="text-base font-semibold text-slate-800 mt-0.5">尺寸統計</h3>
            </div>
            <div className="space-y-3">
              {SHIRT_SIZES.map((size) => {
                const count = sizeStats[size];
                const percentage = registrations.length > 0 ? (count / registrations.length) * 100 : 0;
                return (
                  <div key={size} className="group/size">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600 font-medium">{size}</span>
                      <span className="text-slate-400">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400 group-hover/size:bg-sky-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 3: Additional Info Cards */}

          {/* Dress Code */}
          <div className="col-span-12 md:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-violet-500 tracking-widest uppercase font-medium">Dress Code</p>
                <h3 className="text-base font-semibold text-slate-800 mt-0.5">服裝儀容</h3>
              </div>
              <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                <span>👔</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-violet-50 rounded-xl transition-colors">
                <span className="text-lg">👖</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">下身穿著</p>
                  <p className="text-xs text-slate-500">黑色長褲或長裙（沒有黑色就穿深色）</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-violet-50 rounded-xl transition-colors">
                <span className="text-lg">👟</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">鞋子</p>
                  <p className="text-xs text-slate-500">不可露出腳趾頭</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                <span className="text-lg">👕</span>
                <div>
                  <p className="text-sm font-medium text-emerald-700">我們提供</p>
                  <p className="text-xs text-emerald-600">短袖衣服、襪子</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Tips */}
          <div className="col-span-12 md:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-orange-500 tracking-widest uppercase font-medium">Weather Tips</p>
                <h3 className="text-base font-semibold text-slate-800 mt-0.5">保暖建議</h3>
              </div>
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <span>🧥</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-orange-50 rounded-xl transition-colors">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 shrink-0"></div>
                <p className="text-sm text-slate-600">室內怕冷的人，裡面可以多穿一件<span className="font-medium text-orange-600">薄長袖</span></p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-orange-50 rounded-xl transition-colors">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 shrink-0"></div>
                <p className="text-sm text-slate-600">晚上有<span className="font-medium text-orange-600">戶外野餐</span>，請準備防風措施</p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0"></div>
                <p className="text-sm text-orange-700 font-medium">建議攜帶：防風外套、毛帽</p>
              </div>
            </div>
          </div>

          {/* Dietary Notes */}
          {dietaryList.length > 0 && (
            <div className="col-span-12 bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] text-rose-500 tracking-widest uppercase font-medium">Dietary Notes</p>
                  <h3 className="text-base font-semibold text-slate-800 mt-0.5">上哲點餐中</h3>
                </div>
                <span className="text-sm text-slate-400">{dietaryList.length} 人</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {dietaryList.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center gap-3 p-3 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    <span className="text-sm font-medium text-rose-700">{reg.english_name}</span>
                    <span className="text-rose-300">·</span>
                    <span className="text-sm text-rose-600">{reg.dietary_restrictions}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Registration Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] text-sky-500 tracking-widest uppercase font-medium">Registration</p>
                  <h2 className="text-lg font-semibold text-slate-800">努努參戰</h2>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    中文姓名 <span className="text-sky-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.chinese_name}
                    onChange={(e) =>
                      setFormData({ ...formData, chinese_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-800 transition-all"
                    placeholder="王小明"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    英文姓名 <span className="text-sky-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.english_name}
                    onChange={(e) =>
                      setFormData({ ...formData, english_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-800 transition-all"
                    placeholder="Xiao Ming Wang"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    衣服尺寸 <span className="text-sky-500">*</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {SHIRT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, shirt_size: size })}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                          formData.shirt_size === size
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    飲食禁忌（不能吃）
                  </label>
                  <input
                    type="text"
                    value={formData.dietary_restrictions}
                    onChange={(e) =>
                      setFormData({ ...formData, dietary_restrictions: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-800 transition-all"
                    placeholder="海鮮、牛肉、花生過敏"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    挑食（不愛吃）
                  </label>
                  <input
                    type="text"
                    value={formData.picky_eating}
                    onChange={(e) =>
                      setFormData({ ...formData, picky_eating: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-800 transition-all"
                    placeholder="香菜、茄子、青椒"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5"
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

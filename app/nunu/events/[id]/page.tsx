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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/nunu"
              className="text-stone-400 hover:text-stone-600 transition-colors text-sm"
            >
              ← 返回
            </Link>
          </div>
          <h1 className="text-lg sm:text-xl font-medium text-stone-800">
            {event.title}
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-4">

          {/* Google Meet 行前會議 */}
          {event.preMeeting && (
            <div className="bg-white rounded-lg border border-sky-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-sky-500 tracking-wider mb-1">PRE-MEETING</p>
                  <h3 className="text-base font-medium text-stone-800 mb-2">行前線上會議</h3>
                  <div className="text-sm text-stone-500 space-y-1">
                    <p>
                      {new Date(event.preMeeting.date).toLocaleDateString('zh-TW', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </p>
                    <p>{event.preMeeting.startTime} ~ {event.preMeeting.endTime}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-3">
                  {!preMeetingCountdown.isExpired ? (
                    <>
                      <div className="flex gap-2">
                        <div className="bg-stone-50 rounded px-3 py-2 text-center min-w-[48px] border border-stone-100">
                          <div className="text-lg font-medium text-stone-700">{preMeetingCountdown.days}</div>
                          <div className="text-[10px] text-stone-400">天</div>
                        </div>
                        <div className="bg-stone-50 rounded px-3 py-2 text-center min-w-[48px] border border-stone-100">
                          <div className="text-lg font-medium text-stone-700">{preMeetingCountdown.hours}</div>
                          <div className="text-[10px] text-stone-400">時</div>
                        </div>
                        <div className="bg-stone-50 rounded px-3 py-2 text-center min-w-[48px] border border-stone-100">
                          <div className="text-lg font-medium text-stone-700">{preMeetingCountdown.minutes}</div>
                          <div className="text-[10px] text-stone-400">分</div>
                        </div>
                        <div className="bg-sky-50 rounded px-3 py-2 text-center min-w-[48px] border border-sky-100">
                          <div className="text-lg font-medium text-sky-600">{preMeetingCountdown.seconds}</div>
                          <div className="text-[10px] text-stone-400">秒</div>
                        </div>
                      </div>
                      <a
                        href={event.preMeeting.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm rounded transition-colors"
                      >
                        加入 Google Meet →
                      </a>
                    </>
                  ) : (
                    <a
                      href={event.preMeeting.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded transition-colors"
                    >
                      🔴 會議中，立即加入
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Event Info */}
          <div className="bg-white rounded-lg border border-stone-200 p-5">
            <p className="text-xs text-stone-400 tracking-wider mb-3">EVENT INFO</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-400 mb-1">日期</p>
                <p className="text-stone-700">
                  {new Date(event.date).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </p>
              </div>
              <div>
                <p className="text-stone-400 mb-1">時間</p>
                <p className="text-stone-700">{event.startTime} ~ {event.endTime}</p>
              </div>
              <div>
                <p className="text-stone-400 mb-1">地點</p>
                <p className="text-stone-700">{event.location}</p>
              </div>
              <div>
                <p className="text-stone-400 mb-1">集合時間</p>
                <p className="text-sky-600 font-medium">{event.meetingTime}</p>
              </div>
            </div>
          </div>

          {/* Stats + Registered */}
          <div className="bg-white rounded-lg border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-stone-400 tracking-wider">PARTICIPANTS</p>
              <span className="text-2xl font-light text-sky-500">{registrations.length}</span>
            </div>
            {registrations.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-stone-50 border border-stone-100 rounded p-2 text-center"
                  >
                    <div className="text-[10px] text-sky-500 mb-0.5">
                      #{String(reg.registration_number).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-stone-700 truncate">
                      {reg.english_name}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">
                      {reg.shirt_size}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-400 text-sm text-center py-6">
                還沒有人報名
              </p>
            )}
          </div>

          {/* 服裝儀容 */}
          <div className="bg-white rounded-lg border border-stone-200 p-5">
            <p className="text-xs text-stone-400 tracking-wider mb-4">DRESS CODE</p>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-stone-400 shrink-0">下身</span>
                <p className="text-stone-600">
                  黑色長褲或長裙（沒有黑色就穿深色）
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-stone-400 shrink-0">鞋子</span>
                <p className="text-stone-600">
                  不可露出腳趾頭（我們會提供襪子）
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-stone-400 shrink-0">提供</span>
                <p className="text-stone-600">
                  短袖衣服、襪子
                </p>
              </div>
              <div className="border-t border-stone-100 pt-3 mt-3">
                <p className="text-stone-400 text-xs mb-2">保暖建議</p>
                <ul className="text-stone-500 text-xs space-y-1">
                  <li>• 室內怕冷可多穿一件薄長袖</li>
                  <li>• 晚上有戶外野餐，請備防風外套或毛帽</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 上哲點餐中 */}
          {dietaryList.length > 0 && (
            <div className="bg-white rounded-lg border border-stone-200 p-5">
              <p className="text-xs text-stone-400 tracking-wider mb-4">DIETARY NOTES</p>
              <div className="space-y-2">
                {dietaryList.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-stone-700">{reg.english_name}</span>
                    <span className="text-stone-300">—</span>
                    <span className="text-stone-500">{reg.dietary_restrictions}</span>
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
        className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-full shadow-lg transition-colors text-sm"
      >
        努努參戰 →
      </button>

      {/* Registration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-stone-800">努努參戰</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-stone-400 hover:text-stone-600 text-xl w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">
                    中文姓名 <span className="text-sky-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.chinese_name}
                    onChange={(e) =>
                      setFormData({ ...formData, chinese_name: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-stone-800 text-sm"
                    placeholder="王小明"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">
                    英文姓名 <span className="text-sky-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.english_name}
                    onChange={(e) =>
                      setFormData({ ...formData, english_name: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-stone-800 text-sm"
                    placeholder="Xiao Ming Wang"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">
                    衣服尺寸 <span className="text-sky-500">*</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {SHIRT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, shirt_size: size })}
                        className={`py-2 rounded text-sm transition-colors ${
                          formData.shirt_size === size
                            ? 'bg-sky-500 text-white'
                            : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-sky-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">
                    飲食禁忌（不能吃）
                  </label>
                  <input
                    type="text"
                    value={formData.dietary_restrictions}
                    onChange={(e) =>
                      setFormData({ ...formData, dietary_restrictions: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-stone-800 text-sm"
                    placeholder="海鮮、牛肉、花生過敏"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stone-600 mb-1.5">
                    挑食（不愛吃）
                  </label>
                  <input
                    type="text"
                    value={formData.picky_eating}
                    onChange={(e) =>
                      setFormData({ ...formData, picky_eating: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none text-stone-800 text-sm"
                    placeholder="香菜、茄子、青椒"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {submitting ? '送出中...' : '送出'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

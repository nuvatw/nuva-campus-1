'use client';

import { useEffect, useState, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { nunuEvents } from '@/app/data/nunu-events';
import { NunuEventRegistration, SHIRT_SIZES, ShirtSize } from '@/app/types/nunu';

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

    // Subscribe to realtime changes
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
      // Check if this person already registered (by chinese_name)
      const existingReg = registrations.find(
        (r) => r.chinese_name === formData.chinese_name
      );

      if (existingReg) {
        // Update existing registration
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
        // Get next registration number
        const maxNumber = registrations.length > 0
          ? Math.max(...registrations.map((r) => r.registration_number))
          : 0;

        // Insert new registration
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

      // Reset form and close modal
      setFormData({
        chinese_name: '',
        english_name: '',
        shirt_size: '',
        dietary_restrictions: '',
        picky_eating: '',
      });
      setShowForm(false);

      // Refresh registrations
      await fetchRegistrations();
    } catch (err) {
      console.error('Submit error:', err);
      alert('提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter registrations with dietary restrictions
  const dietaryList = registrations.filter((r) => r.dietary_restrictions);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
            <Link
              href="/nunu"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              ← 返回
            </Link>
            <div className="w-px h-4 sm:h-6 bg-gray-300" />
            <span className="px-2 py-1 bg-primary text-white text-xs rounded-full whitespace-nowrap">
              Nunu 活動
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800 sm:mt-0">
            {event.title}
          </h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Event Info + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">
                活動資訊
              </h3>
              <div className="space-y-3 text-gray-600 text-sm sm:text-base">
                <div className="flex items-center gap-3">
                  <span className="text-lg sm:text-xl">📅</span>
                  <span>
                    {new Date(event.date).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      weekday: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg sm:text-xl">🕐</span>
                  <span>
                    {event.startTime} ~ {event.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg sm:text-xl">📍</span>
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg sm:text-xl">🚩</span>
                  <span className="font-medium text-primary">
                    集合時間：{event.meetingTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 text-center">
                報名統計
              </h3>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl font-bold text-primary">
                    {registrations.length}
                  </div>
                  <div className="text-gray-500 mt-2">人已報名</div>
                </div>
              </div>
            </div>
          </div>

          {/* Registered List */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <h3 className="text-base sm:text-lg font-bold text-success mb-4">
              🎯 已報名 ({registrations.length})
            </h3>
            {registrations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-success-light border-2 border-success rounded-lg p-2 sm:p-3 text-center hover:shadow-md transition-all"
                  >
                    <div className="text-xs font-bold text-success mb-1">
                      #{reg.registration_number}
                    </div>
                    <div className="text-sm font-medium text-success truncate">
                      {reg.english_name}
                    </div>
                    <div className="text-xs text-success/70 mt-1">
                      {reg.shirt_size}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                還沒有人報名，快來成為第一個！
              </p>
            )}
          </div>

          {/* 上哲點餐中 */}
          {dietaryList.length > 0 && (
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-amber-600 mb-4">
                🍽️ 上哲點餐中
              </h3>
              <div className="space-y-2">
                {dietaryList.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3"
                  >
                    <span className="font-medium text-amber-800">
                      {reg.english_name}
                    </span>
                    <span className="text-amber-600">不能吃：</span>
                    <span className="text-amber-900 font-medium">
                      {reg.dietary_restrictions}
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
        className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-primary text-white font-bold rounded-full shadow-2xl hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2 text-sm sm:text-base"
      >
        <span className="text-lg sm:text-xl">🙋</span>
        <span>努努參戰</span>
      </button>

      {/* Registration Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">努努參戰表單</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    中文姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.chinese_name}
                    onChange={(e) =>
                      setFormData({ ...formData, chinese_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900"
                    placeholder="王小明"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    英文姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.english_name}
                    onChange={(e) =>
                      setFormData({ ...formData, english_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900"
                    placeholder="Xiao Ming Wang"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    衣服尺寸 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {SHIRT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, shirt_size: size })}
                        className={`py-2 rounded-lg font-medium transition-all ${
                          formData.shirt_size === size
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    飲食禁忌（不能吃）
                  </label>
                  <input
                    type="text"
                    value={formData.dietary_restrictions}
                    onChange={(e) =>
                      setFormData({ ...formData, dietary_restrictions: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900"
                    placeholder="如：海鮮、牛肉、花生過敏"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    挑食（不愛吃）
                  </label>
                  <input
                    type="text"
                    value={formData.picky_eating}
                    onChange={(e) =>
                      setFormData({ ...formData, picky_eating: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900"
                    placeholder="如：香菜、茄子、青椒"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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

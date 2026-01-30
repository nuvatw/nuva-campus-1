'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { supabase } from '@/app/lib/supabase';

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

  const [mission, setMission] = useState<Mission | null>(null);
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: missionData } = await supabase
          .from('missions')
          .select('*')
          .eq('id', id.toLowerCase())
          .single();

        if (missionData) {
          setMission(missionData);
        }

        const { data: ambassadorData } = await supabase
          .from('ambassadors')
          .select('*')
          .eq('is_alive', true)
          .order('ambassador_id', { ascending: true });

        if (ambassadorData) {
          setAmbassadors(ambassadorData);
        }

        const { data: submissionData } = await supabase
          .from('mission_submissions')
          .select('*')
          .eq('mission_id', id.toLowerCase())
          .order('submitted_at', { ascending: true });

        if (submissionData) {
          setSubmissions(submissionData);
        }
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

  useEffect(() => {
    if (!mission?.due_date) return;

    const updateCountdown = () => {
      const now = new Date();
      const dueDate = new Date(mission.due_date + 'T23:59:59');
      const diff = dueDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('已截止');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setCountdown(`${days} 天 ${hours} 小時 ${minutes} 分 ${seconds} 秒`);
      } else if (hours > 0) {
        setCountdown(`${hours} 小時 ${minutes} 分 ${seconds} 秒`);
      } else {
        setCountdown(`${minutes} 分 ${seconds} 秒`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [mission]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">載入中...</div>
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
  
  // 顯示大寫的 M05
  const missionDisplay = mission.id.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <Script src="https://tally.so/widgets/embed.js" strategy="afterInteractive" />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/ambassador" className="text-gray-600 hover:text-gray-900 transition-colors">← 返回</Link>
            <div className="w-px h-6 bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-800">{missionDisplay}</h1>
            <span className={`px-3 py-1 text-white text-sm rounded-full ${mission.status === 'ongoing' ? 'bg-primary' : mission.status === 'done' ? 'bg-success' : 'bg-gray-400'}`}>
              {mission.status === 'ongoing' ? '🔥 進行中' : mission.status === 'done' ? '✓ 已完成' : '🔒 未開放'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">任務資訊</h3>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📋</span>
                  <span className="font-medium">{mission.name}</span>
                </div>
                {mission.description && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📝</span>
                    <span className="whitespace-pre-line">{mission.description}</span>
                  </div>
                )}
                {mission.due_date && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    <span>截止日期：{new Date(mission.due_date).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>

            {mission.due_date && mission.status === 'ongoing' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-primary/20 text-center flex flex-col justify-center">
                <div className="text-sm text-gray-500 mb-2">⏰ 繳交倒數</div>
                <div className="text-3xl font-bold text-primary">{countdown}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary-light rounded-xl p-4 shadow-sm text-center border-2 border-primary">
              <div className="text-3xl font-bold text-primary">{submissionRate}%</div>
              <div className="text-sm text-primary mt-1">繳交率</div>
            </div>
            <div className="bg-success-light rounded-xl p-4 shadow-sm text-center border-2 border-success">
              <div className="text-3xl font-bold text-success">{submittedCount}</div>
              <div className="text-sm text-success mt-1">已繳交</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 shadow-sm text-center border-2 border-gray-300">
              <div className="text-3xl font-bold text-gray-600">{notSubmittedAmbassadors.length}</div>
              <div className="text-sm text-gray-500 mt-1">未繳交</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>繳交進度</span>
              <span className="font-medium">{submittedCount} / {totalAmbassadors} 人</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div className="bg-success h-4 rounded-full transition-all duration-500" style={{ width: `${submissionRate}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-4">⏳ 尚未繳交 ({notSubmittedAmbassadors.length})</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {notSubmittedAmbassadors.map((ambassador) => (
                <div key={ambassador.id} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-center hover:shadow-md transition-all">
                  <div className="text-xs font-bold text-gray-500 mb-1">#{ambassador.ambassador_id}</div>
                  <div className="text-sm font-medium text-gray-700">{ambassador.name}</div>
                </div>
              ))}
            </div>
            {notSubmittedAmbassadors.length === 0 && (
              <p className="text-gray-400 text-center py-8">太棒了！所有人都已繳交 🎉</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-success mb-4">✓ 已繳交 ({submittedAmbassadors.length})</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {submittedAmbassadors.map((ambassador) => {
                const submission = submissions.find((s) => s.ambassador_id === ambassador.ambassador_id);
                return (
                  <div key={ambassador.id} className="bg-success-light border-2 border-success rounded-lg p-3 text-center hover:shadow-md transition-all relative group cursor-pointer">
                    <div className="text-xs font-bold text-success mb-1">#{ambassador.ambassador_id}</div>
                    <div className="text-sm font-medium text-success">{ambassador.name}</div>
                    {submission && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {new Date(submission.submitted_at).toLocaleString('zh-TW')}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {submittedAmbassadors.length === 0 && (
              <p className="text-gray-400 text-center py-8">還沒有人繳交</p>
            )}
          </div>
        </div>
      </div>

      {mission.status === 'ongoing' && (
        <a href={tallyUrl} className="fixed bottom-8 right-8 z-50 px-6 py-4 bg-primary text-white font-bold rounded-full shadow-2xl hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2">
          <span className="text-xl">📤</span>
          <span>繳交任務</span>
        </a>
      )}
    </div>
  );
}
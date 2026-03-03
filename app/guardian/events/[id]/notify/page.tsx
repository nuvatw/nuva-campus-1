'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';

interface NotificationRecord {
  id: string;
  participant_name: string;
  participant_email: string;
  notification_sent: boolean;
  notification_sent_at: string | null;
  checkin_code: string;
  lunch_code: string;
}

export default function NotifyPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [records, setRecords] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const stats = {
    sent: records.filter(r => r.notification_sent).length,
    pending: records.filter(r => !r.notification_sent).length,
  };

  useEffect(() => {
    fetchRecords();
  }, [eventId]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('id, participant_name, participant_email, notification_sent, notification_sent_at, checkin_code, lunch_code')
        .eq('event_id', eventId)
        .order('notification_sent', { ascending: true })
        .order('participant_name', { ascending: true });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setMessage(null);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'test',
          eventId,
          to: 'ceo@meetnuva.com',
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setTestSuccess(true);
      setMessage({ type: 'success', text: '測試郵件已發送到 ceo@meetnuva.com' });
      setTimeout(() => setTestSuccess(false), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '發送失敗' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendAll = async () => {
    if (!confirm(`確定要發送 ${stats.pending} 封郵件嗎？`)) return;

    setIsSendingAll(true);
    setMessage(null);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'batch',
          eventId,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setMessage({ type: 'success', text: `成功發送 ${result.sent} 封郵件` });
      fetchRecords(); // 重新載入
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '發送失敗' });
    } finally {
      setIsSendingAll(false);
    }
  };

  return (
    <div className="py-8 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/guardian/events/${eventId}`}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">返回</span>
          </Link>
          <h1 className="text-lg font-medium text-text-primary">發送通知</h1>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-success/10 text-success'
                : 'bg-error/10 text-error'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 統計 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-sm text-text-secondary mb-1">已發送</p>
            <p className="text-3xl font-semibold text-text-primary">{stats.sent}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-text-secondary mb-1">未發送</p>
            <p className="text-3xl font-semibold text-warning">{stats.pending}</p>
          </div>
        </div>

        {/* 發送選項 */}
        <div className="space-y-4">
          {/* 測試郵件 */}
          <div className="card">
            <h2 className="text-lg font-medium text-text-primary mb-2">測試郵件</h2>
            <p className="text-sm text-text-secondary mb-4">
              發送一封測試郵件到 ceo@meetnuva.com
            </p>

            <button
              onClick={handleSendTest}
              disabled={isSendingTest}
              className="btn-secondary w-full disabled:opacity-50"
            >
              {isSendingTest ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  發送中...
                </span>
              ) : testSuccess ? (
                <span className="flex items-center justify-center gap-2 text-success">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  已發送
                </span>
              ) : (
                '發送測試郵件'
              )}
            </button>
          </div>

          {/* 發送全部 */}
          <div className="card">
            <h2 className="text-lg font-medium text-text-primary mb-2">發送給所有未通知的參與者</h2>
            <p className="text-sm text-text-secondary mb-4">
              將發送 <span className="font-medium text-warning">{stats.pending}</span> 封郵件
            </p>

            <button
              onClick={handleSendAll}
              disabled={isSendingAll || stats.pending === 0}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isSendingAll ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  發送中...
                </span>
              ) : (
                '發送全部郵件'
              )}
            </button>
          </div>
        </div>

        {/* 發送記錄 */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-text-primary mb-4">發送記錄</h2>

          {loading ? (
            <div className="text-center py-8 text-text-muted">載入中...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-text-muted">沒有報名資料</div>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div key={record.id} className="card py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary">{record.participant_name}</p>
                      <p className="text-sm text-text-secondary">{record.participant_email}</p>
                      <p className="text-xs text-text-muted mt-1">
                        報到碼: {record.checkin_code || '-'} | 便當碼: {record.lunch_code || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      {record.notification_sent ? (
                        <>
                          <p className="text-sm text-success">已發送</p>
                          <p className="text-xs text-text-muted">
                            {record.notification_sent_at
                              ? new Date(record.notification_sent_at).toLocaleString('zh-TW')
                              : '-'}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-warning">未發送</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

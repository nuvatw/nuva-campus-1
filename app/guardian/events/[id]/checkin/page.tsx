'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { supabase, isSupabaseConfigured } from '@/app/lib/supabase';
import { NumericKeypad, CodeInput, Button, Modal, useToast } from '@/app/components/ui';

interface Participant {
  id: string;
  participant_name: string;
  participant_email: string;
  attended: boolean;
  ambassador_id: string | null;
  attendance_mode: string;
  member_type: string;
}

async function fetchStats(eventId: string) {
  if (!isSupabaseConfigured) return { total: 0, checkedIn: 0 };

  const { data } = await supabase
    .from('event_registrations')
    .select('attended, attendance_mode')
    .eq('event_id', eventId)
    .eq('attendance_mode', 'offline');

  return {
    total: data?.length || 0,
    checkedIn: data?.filter(r => r.attended).length || 0,
  };
}

async function fetchParticipants(eventId: string): Promise<Participant[]> {
  if (!isSupabaseConfigured) return [];

  const { data } = await supabase
    .from('event_registrations')
    .select('id, participant_name, participant_email, attended, ambassador_id, attendance_mode, member_type')
    .eq('event_id', eventId)
    .eq('attendance_mode', 'offline')
    .order('ambassador_id', { ascending: true, nullsFirst: false });

  return data || [];
}

function LoadingSkeleton() {
  return (
    <div className="py-8 px-6 min-h-[calc(100vh-120px)]">
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-32 bg-bg-secondary rounded mx-auto mb-8 animate-pulse" />
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-14 h-16 bg-bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CheckinPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { showToast } = useToast();

  const [code, setCode] = useState<string[]>(['', '', '']);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnlyPending, setShowOnlyPending] = useState(true);

  const { data: stats, isLoading: statsLoading } = useSWR(
    eventId ? `checkin-stats-${eventId}` : null,
    () => fetchStats(eventId),
    { refreshInterval: 10000 }
  );

  const { data: participants } = useSWR(
    eventId ? `checkin-participants-${eventId}` : null,
    () => fetchParticipants(eventId),
    { refreshInterval: 10000 }
  );

  // 分類參與者
  const ambassadors = (participants || [])
    .filter(p => p.member_type === 'ambassador')
    .sort((a, b) => parseInt(a.ambassador_id || '999') - parseInt(b.ambassador_id || '999'));

  const nunus = (participants || [])
    .filter(p => p.member_type === 'nunu')
    .sort((a, b) => a.participant_name.localeCompare(b.participant_name, 'zh-TW'));

  // 過濾已報到
  const filteredAmbassadors = showOnlyPending ? ambassadors.filter(p => !p.attended) : ambassadors;
  const filteredNunus = showOnlyPending ? nunus.filter(p => !p.attended) : nunus;

  const handleDigit = useCallback((digit: string) => {
    setCode((prev) => {
      const newCode = [...prev];
      const emptyIndex = newCode.findIndex((d) => d === '');
      if (emptyIndex !== -1) {
        newCode[emptyIndex] = digit;
      }
      return newCode;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setCode((prev) => {
      const newCode = [...prev];
      for (let i = newCode.length - 1; i >= 0; i--) {
        if (newCode[i] !== '') {
          newCode[i] = '';
          break;
        }
      }
      return newCode;
    });
  }, []);

  // 當輸入完 3 位數字，查找大使
  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 3) {
      const found = ambassadors.find(p => p.ambassador_id === fullCode);
      if (found) {
        setSelectedParticipant(found);
        setShowModal(true);
      } else {
        showToast('error', `找不到大使編號 ${fullCode}`);
        setCode(['', '', '']);
      }
    }
  }, [code, ambassadors, showToast]);

  const handleCheckin = async (participant: Participant) => {
    if (participant.attended) {
      showToast('warning', '此參與者已報到');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({
          attended: true,
          attended_at: new Date().toISOString(),
        })
        .eq('id', participant.id);

      if (error) throw error;

      showToast('success', `${participant.participant_name} 報到成功`);
      mutate(`checkin-stats-${eventId}`);
      mutate(`checkin-participants-${eventId}`);
      setShowModal(false);
      setSelectedParticipant(null);
      setCode(['', '', '']);
    } catch {
      showToast('error', '報到失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedParticipant(null);
    setCode(['', '', '']);
  };

  if (statsLoading || !stats) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="py-8 px-6 min-h-[calc(100vh-120px)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/guardian/events/${eventId}`}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">返回</span>
          </Link>
          <div className="text-text-secondary">
            已報到 <span className="font-medium text-text-primary">{stats.checkedIn}</span> / {stats.total}
          </div>
        </div>

        {/* Section 1: 大使編號輸入 */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4 text-center">
            輸入大使編號報到
          </h2>
          <div className="mb-6">
            <CodeInput code={code} label="請輸入 3 位大使編號" />
          </div>
          <NumericKeypad
            onDigit={handleDigit}
            onBackspace={handleBackspace}
          />
        </div>

        {/* Section 2: 參與者列表 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              實體參與者
            </h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyPending}
                onChange={(e) => setShowOnlyPending(e.target.checked)}
                className="rounded border-border-light"
              />
              <span className="text-text-secondary">只顯示尚未報到</span>
            </label>
          </div>

          {/* 校園大使 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-text-muted mb-2">
              校園大使 ({filteredAmbassadors.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left py-2 px-3 text-text-muted font-medium w-20">大使</th>
                    <th className="text-left py-2 px-3 text-text-muted font-medium">姓名</th>
                    <th className="text-left py-2 px-3 text-text-muted font-medium">信箱</th>
                    <th className="text-center py-2 px-3 text-text-muted font-medium w-16">狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAmbassadors.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => handleRowClick(p)}
                      className={`border-b border-border-light cursor-pointer transition-colors ${
                        p.attended ? 'bg-success/5 opacity-60' : 'hover:bg-bg-secondary'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-medium text-primary">
                        #{p.ambassador_id}
                      </td>
                      <td className="py-3 px-3 font-medium">{p.participant_name}</td>
                      <td className="py-3 px-3 text-text-muted text-xs">{p.participant_email}</td>
                      <td className="py-3 px-3 text-center">
                        {p.attended ? (
                          <span className="text-success">✓</span>
                        ) : (
                          <span className="text-text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAmbassadors.length === 0 && (
                <p className="text-text-muted text-center py-4 text-sm">
                  {showOnlyPending ? '所有校園大使都已報到' : '沒有校園大使'}
                </p>
              )}
            </div>
          </div>

          {/* 努努 */}
          <div>
            <h3 className="text-sm font-medium text-text-muted mb-2">
              努努 ({filteredNunus.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="text-left py-2 px-3 text-text-muted font-medium">姓名</th>
                    <th className="text-left py-2 px-3 text-text-muted font-medium">信箱</th>
                    <th className="text-center py-2 px-3 text-text-muted font-medium w-16">狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNunus.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => handleRowClick(p)}
                      className={`border-b border-border-light cursor-pointer transition-colors ${
                        p.attended ? 'bg-success/5 opacity-60' : 'hover:bg-bg-secondary'
                      }`}
                    >
                      <td className="py-3 px-3 font-medium">{p.participant_name}</td>
                      <td className="py-3 px-3 text-text-muted text-xs">{p.participant_email}</td>
                      <td className="py-3 px-3 text-center">
                        {p.attended ? (
                          <span className="text-success">✓</span>
                        ) : (
                          <span className="text-text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredNunus.length === 0 && (
                <p className="text-text-muted text-center py-4 text-sm">
                  {showOnlyPending ? '所有努努都已報到' : '沒有努努'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 報到確認 Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="確認報到"
        showCloseButton={false}
        footer={
          <div className="flex gap-4 w-full">
            <Button variant="secondary" onClick={handleCloseModal} fullWidth>
              返回
            </Button>
            {selectedParticipant && !selectedParticipant.attended && (
              <Button
                onClick={() => handleCheckin(selectedParticipant)}
                isLoading={isLoading}
                fullWidth
              >
                確認報到
              </Button>
            )}
          </div>
        }
      >
        {selectedParticipant && (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border-light">
              <span className="text-text-muted">姓名</span>
              <span className="font-medium text-text-primary">{selectedParticipant.participant_name}</span>
            </div>
            {selectedParticipant.ambassador_id && (
              <div className="flex justify-between items-center py-2 border-b border-border-light">
                <span className="text-text-muted">大使編號</span>
                <span className="font-mono font-medium text-primary">#{selectedParticipant.ambassador_id}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-border-light">
              <span className="text-text-muted">信箱</span>
              <span className="text-text-primary text-sm">{selectedParticipant.participant_email}</span>
            </div>
            {selectedParticipant.attended && (
              <div className="bg-success/10 text-success text-center py-2 rounded-lg">
                已報到
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

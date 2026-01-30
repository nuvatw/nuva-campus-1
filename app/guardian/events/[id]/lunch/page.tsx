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
  lunch_collected: boolean;
  lunch_box_required: boolean;
  ambassador_id: string | null;
  attendance_mode: string;
  member_type: string;
}

async function fetchStats(eventId: string) {
  if (!isSupabaseConfigured) return { total: 0, collected: 0 };

  const { data } = await supabase
    .from('event_registrations')
    .select('lunch_box_required, lunch_collected, attendance_mode')
    .eq('event_id', eventId)
    .eq('attendance_mode', 'offline')
    .eq('lunch_box_required', true);

  return {
    total: data?.length || 0,
    collected: data?.filter(r => r.lunch_collected).length || 0,
  };
}

async function fetchParticipants(eventId: string): Promise<Participant[]> {
  if (!isSupabaseConfigured) return [];

  const { data } = await supabase
    .from('event_registrations')
    .select('id, participant_name, participant_email, lunch_collected, lunch_box_required, ambassador_id, attendance_mode, member_type')
    .eq('event_id', eventId)
    .eq('attendance_mode', 'offline')
    .eq('lunch_box_required', true)
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

export default function LunchPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { showToast } = useToast();

  const [code, setCode] = useState<string[]>(['', '', '']);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnlyPending, setShowOnlyPending] = useState(true);

  const { data: stats, isLoading: statsLoading } = useSWR(
    eventId ? `lunch-stats-${eventId}` : null,
    () => fetchStats(eventId),
    { refreshInterval: 10000 }
  );

  const { data: participants } = useSWR(
    eventId ? `lunch-participants-${eventId}` : null,
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

  // 過濾已領取
  const filteredAmbassadors = showOnlyPending ? ambassadors.filter(p => !p.lunch_collected) : ambassadors;
  const filteredNunus = showOnlyPending ? nunus.filter(p => !p.lunch_collected) : nunus;

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
        showToast('error', `找不到大使編號 ${fullCode} 或該大使不需要便當`);
        setCode(['', '', '']);
      }
    }
  }, [code, ambassadors, showToast]);

  const handleCollect = async (participant: Participant) => {
    if (participant.lunch_collected) {
      showToast('warning', '此便當已領取');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({
          lunch_collected: true,
          lunch_collected_at: new Date().toISOString(),
        })
        .eq('id', participant.id);

      if (error) throw error;

      showToast('success', `${participant.participant_name} 便當領取成功`);
      mutate(`lunch-stats-${eventId}`);
      mutate(`lunch-participants-${eventId}`);
      setShowModal(false);
      setSelectedParticipant(null);
      setCode(['', '', '']);
    } catch {
      showToast('error', '領取失敗，請重試');
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
            已領取 <span className="font-medium text-text-primary">{stats.collected}</span> / {stats.total}
          </div>
        </div>

        {/* Section 1: 大使編號輸入 */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4 text-center">
            輸入大使編號領取便當
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
              需便當者
            </h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyPending}
                onChange={(e) => setShowOnlyPending(e.target.checked)}
                className="rounded border-border-light"
              />
              <span className="text-text-secondary">只顯示尚未領取</span>
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
                        p.lunch_collected ? 'bg-success/5 opacity-60' : 'hover:bg-bg-secondary'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-medium text-primary">
                        #{p.ambassador_id}
                      </td>
                      <td className="py-3 px-3 font-medium">{p.participant_name}</td>
                      <td className="py-3 px-3 text-text-muted text-xs">{p.participant_email}</td>
                      <td className="py-3 px-3 text-center">
                        {p.lunch_collected ? (
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
                  {showOnlyPending ? '所有校園大使都已領取' : '沒有需便當的校園大使'}
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
                        p.lunch_collected ? 'bg-success/5 opacity-60' : 'hover:bg-bg-secondary'
                      }`}
                    >
                      <td className="py-3 px-3 font-medium">{p.participant_name}</td>
                      <td className="py-3 px-3 text-text-muted text-xs">{p.participant_email}</td>
                      <td className="py-3 px-3 text-center">
                        {p.lunch_collected ? (
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
                  {showOnlyPending ? '所有努努都已領取' : '沒有需便當的努努'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 領取確認 Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="確認領取便當"
        showCloseButton={false}
        footer={
          <div className="flex gap-4 w-full">
            <Button variant="secondary" onClick={handleCloseModal} fullWidth>
              返回
            </Button>
            {selectedParticipant && !selectedParticipant.lunch_collected && (
              <Button
                onClick={() => handleCollect(selectedParticipant)}
                isLoading={isLoading}
                fullWidth
              >
                確認領取
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
            {selectedParticipant.lunch_collected && (
              <div className="bg-success/10 text-success text-center py-2 rounded-lg">
                已領取
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

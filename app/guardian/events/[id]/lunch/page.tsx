'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { supabase, isSupabaseConfigured } from '@/app/lib/supabase';
import { Button, Modal, useToast } from '@/app/components/ui';

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

async function fetchParticipants(eventId: string): Promise<Participant[]> {
  if (!isSupabaseConfigured) {
    console.error('Supabase not configured');
    throw new Error('Supabase 未設定');
  }

  const { data, error } = await supabase
    .from('event_registrations')
    .select('id, participant_name, participant_email, lunch_collected, lunch_box_required, ambassador_id, attendance_mode, member_type')
    .eq('event_id', eventId)
    .eq('attendance_mode', 'offline')
    .eq('lunch_box_required', true);

  if (error) {
    console.error('Fetch error:', error);
    throw new Error(error.message);
  }

  return data || [];
}

function LoadingSkeleton() {
  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-24 bg-bg-secondary rounded-xl animate-pulse" />
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

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnlyPending, setShowOnlyPending] = useState(true);

  const { data: participants, isLoading: dataLoading, error } = useSWR(
    eventId ? `lunch-participants-${eventId}` : null,
    () => fetchParticipants(eventId),
    { refreshInterval: 10000 }
  );

  // Debug log
  if (error) {
    console.error('SWR error:', error);
  }

  // 分類參與者
  const ambassadors = (participants || [])
    .filter(p => p.member_type === 'ambassador' && p.ambassador_id)
    .sort((a, b) => parseInt(a.ambassador_id || '999') - parseInt(b.ambassador_id || '999'));

  const nunus = (participants || [])
    .filter(p => p.member_type === 'nunu')
    .sort((a, b) => a.participant_name.localeCompare(b.participant_name, 'zh-TW'));

  // 統計
  const totalCount = (participants || []).length;
  const collectedCount = (participants || []).filter(p => p.lunch_collected).length;

  // 過濾
  const filteredAmbassadors = showOnlyPending ? ambassadors.filter(p => !p.lunch_collected) : ambassadors;
  const filteredNunus = showOnlyPending ? nunus.filter(p => !p.lunch_collected) : nunus;

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
      mutate(`lunch-participants-${eventId}`);
      setShowModal(false);
      setSelectedParticipant(null);
    } catch {
      showToast('error', '領取失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndoCollect = async (participant: Participant) => {
    if (!participant.lunch_collected) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({
          lunch_collected: false,
          lunch_collected_at: null,
        })
        .eq('id', participant.id);

      if (error) throw error;

      showToast('success', `${participant.participant_name} 已撤銷領取`);
      mutate(`lunch-participants-${eventId}`);
      setShowModal(false);
      setSelectedParticipant(null);
    } catch {
      showToast('error', '撤銷失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedParticipant(null);
  };

  if (dataLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="py-8 px-6">
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
          <h1 className="text-xl font-semibold text-text-primary">便當領取</h1>
          <div className="text-text-secondary">
            <span className="font-medium text-primary">{collectedCount}</span> / {totalCount}
          </div>
        </div>

        {/* Filter */}
        <div className="flex justify-end mb-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
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
        <div className="mb-8">
          <h2 className="text-lg font-medium text-text-primary mb-4">
            校園大使 ({filteredAmbassadors.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredAmbassadors.map((p) => (
              <button
                key={p.id}
                onClick={() => handleCardClick(p)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  p.lunch_collected
                    ? 'bg-success/10 border-success/30 opacity-60'
                    : 'bg-bg-card border-border-light hover:border-primary hover:shadow-md'
                }`}
              >
                <div className="text-2xl font-bold text-primary mb-1">
                  #{p.ambassador_id}
                </div>
                <div className="text-sm font-medium text-text-primary truncate">
                  {p.participant_name}
                </div>
                {p.lunch_collected && (
                  <div className="text-xs text-success mt-1">✓ 已領取</div>
                )}
              </button>
            ))}
          </div>
          {filteredAmbassadors.length === 0 && (
            <p className="text-text-muted text-center py-8">
              {showOnlyPending ? '所有校園大使都已領取 🎉' : '沒有需便當的校園大使'}
            </p>
          )}
        </div>

        {/* 努努 */}
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">
            努努 ({filteredNunus.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredNunus.map((p) => (
              <button
                key={p.id}
                onClick={() => handleCardClick(p)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  p.lunch_collected
                    ? 'bg-success/10 border-success/30 opacity-60'
                    : 'bg-bg-card border-border-light hover:border-primary hover:shadow-md'
                }`}
              >
                <div className="text-sm font-medium text-text-primary truncate">
                  {p.participant_name}
                </div>
                <div className="text-xs text-text-muted truncate mt-1">
                  {p.participant_email}
                </div>
                {p.lunch_collected && (
                  <div className="text-xs text-success mt-1">✓ 已領取</div>
                )}
              </button>
            ))}
          </div>
          {filteredNunus.length === 0 && (
            <p className="text-text-muted text-center py-8">
              {showOnlyPending ? '所有努努都已領取 🎉' : '沒有需便當的努努'}
            </p>
          )}
        </div>

        {/* Error info */}
        {error && (
          <div className="mt-8 p-4 bg-error/10 rounded-lg text-sm text-error">
            <p className="font-medium mb-2">資料載入失敗</p>
            <p className="text-text-muted">{error.message}</p>
            <button
              onClick={() => mutate(`lunch-participants-${eventId}`)}
              className="mt-3 text-primary hover:underline"
            >
              重新載入
            </button>
          </div>
        )}

        {/* Debug info */}
        {!error && totalCount === 0 && (
          <div className="mt-8 p-4 bg-warning/10 rounded-lg text-sm text-warning">
            <p className="font-medium mb-2">沒有找到需要便當的參與者</p>
            <p className="text-text-muted">請確認 Supabase RLS 設定，或資料條件：</p>
            <ul className="list-disc list-inside text-text-muted mt-1">
              <li>event_id = &quot;{eventId}&quot;</li>
              <li>attendance_mode = &quot;offline&quot;</li>
              <li>lunch_box_required = true</li>
            </ul>
          </div>
        )}
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
            {selectedParticipant && selectedParticipant.lunch_collected && (
              <Button
                variant="secondary"
                onClick={() => handleUndoCollect(selectedParticipant)}
                isLoading={isLoading}
                fullWidth
                className="!bg-error/10 !text-error !border-error/30 hover:!bg-error/20"
              >
                撤銷領取
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
                <span className="font-mono font-bold text-primary text-xl">#{selectedParticipant.ambassador_id}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-border-light">
              <span className="text-text-muted">信箱</span>
              <span className="text-text-primary text-sm">{selectedParticipant.participant_email}</span>
            </div>
            {selectedParticipant.lunch_collected && (
              <div className="bg-success/10 text-success text-center py-3 rounded-lg font-medium">
                ✓ 已領取
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { supabase, isSupabaseConfigured } from '@/app/lib/supabase';
import { Button, Modal, NumericKeypad, useToast } from '@/app/components/ui';

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

type FilterMode = 'all' | 'pending' | 'completed';

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
  const [filterMode, setFilterMode] = useState<FilterMode>('pending');
  const [searchId, setSearchId] = useState('');

  const { data: participants, isLoading: dataLoading, error } = useSWR(
    eventId ? `lunch-participants-${eventId}` : null,
    () => fetchParticipants(eventId),
    { refreshInterval: 10000 }
  );

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
  const filterParticipants = (list: Participant[]) => {
    if (filterMode === 'pending') return list.filter(p => !p.lunch_collected);
    if (filterMode === 'completed') return list.filter(p => p.lunch_collected);
    return list;
  };

  const filteredAmbassadors = filterParticipants(ambassadors);
  const filteredNunus = filterParticipants(nunus);

  // 自動查詢 - 輸入 3 位數時自動彈出
  useEffect(() => {
    if (searchId.length === 3) {
      const found = ambassadors.find(p => p.ambassador_id === searchId);
      if (found) {
        setSelectedParticipant(found);
        setShowModal(true);
        setSearchId('');
      } else {
        showToast('warning', `找不到大使編號 ${searchId}`);
        setSearchId('');
      }
    }
  }, [searchId, ambassadors, showToast]);

  const handleDigit = (digit: string) => {
    if (searchId.length < 3) {
      setSearchId(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setSearchId(prev => prev.slice(0, -1));
  };

  const handleCollect = async (participant: Participant) => {
    if (participant.lunch_collected) {
      showToast('warning', '此便當已領取');
      return;
    }

    setIsLoading(true);
    try {
      const { error, data } = await supabase
        .from('event_registrations')
        .update({ lunch_collected: true })
        .eq('id', participant.id)
        .select();

      if (error) {
        console.error('Update error:', error);
        throw new Error(error.message);
      }

      console.log('Update success:', data);
      showToast('success', `${participant.participant_name} 便當領取成功`);
      mutate(`lunch-participants-${eventId}`);
      setShowModal(false);
      setSelectedParticipant(null);
    } catch (err) {
      console.error('Collect failed:', err);
      showToast('error', `領取失敗：${err instanceof Error ? err.message : '請重試'}`);
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
        .update({ lunch_collected: false })
        .eq('id', participant.id);

      if (error) {
        console.error('Undo error:', error);
        throw new Error(error.message);
      }

      showToast('success', `${participant.participant_name} 已撤銷領取`);
      mutate(`lunch-participants-${eventId}`);
      setShowModal(false);
      setSelectedParticipant(null);
    } catch (err) {
      console.error('Undo failed:', err);
      showToast('error', `撤銷失敗：${err instanceof Error ? err.message : '請重試'}`);
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

        {/* Quick Search with Keypad */}
        <div className="mb-6 p-4 bg-bg-card rounded-xl border border-border-light">
          <label className="block text-sm font-medium text-text-primary mb-3 text-center">
            輸入大使編號快速領取
          </label>

          {/* Display */}
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-14 h-16 rounded-lg border-2 flex items-center justify-center text-3xl font-bold ${
                  searchId[i]
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border-light bg-bg-secondary text-text-muted'
                }`}
              >
                {searchId[i] || ''}
              </div>
            ))}
          </div>

          {/* Keypad */}
          <NumericKeypad
            onDigit={handleDigit}
            onBackspace={handleBackspace}
            size="lg"
          />
        </div>

        {/* Filter */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-primary text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            全部 ({totalCount})
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterMode === 'pending'
                ? 'bg-primary text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            尚未領取 ({totalCount - collectedCount})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterMode === 'completed'
                ? 'bg-primary text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            已領取 ({collectedCount})
          </button>
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
              {filterMode === 'pending' ? '所有校園大使都已領取' :
               filterMode === 'completed' ? '尚無校園大使領取' : '沒有需便當的校園大使'}
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
              {filterMode === 'pending' ? '所有努努都已領取' :
               filterMode === 'completed' ? '尚無努努領取' : '沒有需便當的努努'}
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

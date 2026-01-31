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
  attended: boolean;
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
    .select('id, participant_name, participant_email, attended, ambassador_id, attendance_mode, member_type')
    .eq('event_id', eventId)
    .eq('attendance_mode', 'offline');

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

export default function CheckinPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { showToast } = useToast();

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('pending');
  const [searchId, setSearchId] = useState('');

  const { data: participants, isLoading: dataLoading, error } = useSWR(
    eventId ? `checkin-participants-${eventId}` : null,
    () => fetchParticipants(eventId),
    { refreshInterval: 10000 }
  );

  // 分類參與者
  const ambassadors = (participants || [])
    .filter(p => p.member_type === 'ambassador')
    .sort((a, b) => {
      // 有編號的排前面，按編號排序
      if (a.ambassador_id && b.ambassador_id) {
        return parseInt(a.ambassador_id) - parseInt(b.ambassador_id);
      }
      if (a.ambassador_id) return -1;
      if (b.ambassador_id) return 1;
      // 沒編號的按姓名排序
      return a.participant_name.localeCompare(b.participant_name, 'zh-TW');
    });

  const nunus = (participants || [])
    .filter(p => p.member_type === 'nunu')
    .sort((a, b) => a.participant_name.localeCompare(b.participant_name, 'zh-TW'));

  // 其他（沒有設定 member_type 的參與者）
  const others = (participants || [])
    .filter(p => p.member_type !== 'ambassador' && p.member_type !== 'nunu')
    .sort((a, b) => a.participant_name.localeCompare(b.participant_name, 'zh-TW'));

  // 統計（只計算努努和校園大使）
  const totalCount = nunus.length + ambassadors.length;
  const checkedInCount = [...nunus, ...ambassadors].filter(p => p.attended).length;

  // 過濾
  const filterParticipants = (list: Participant[]) => {
    if (filterMode === 'pending') return list.filter(p => !p.attended);
    if (filterMode === 'completed') return list.filter(p => p.attended);
    return list;
  };

  const filteredAmbassadors = filterParticipants(ambassadors);
  const filteredNunus = filterParticipants(nunus);
  const filteredOthers = filterParticipants(others);

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

  const handleCheckin = async (participant: Participant) => {
    if (participant.attended) {
      showToast('warning', '此參與者已報到');
      return;
    }

    setIsLoading(true);
    try {
      const { error, data } = await supabase
        .from('event_registrations')
        .update({ attended: true })
        .eq('id', participant.id)
        .select();

      if (error) {
        console.error('Update error:', error);
        throw new Error(error.message);
      }

      console.log('Update success:', data);
      showToast('success', `${participant.participant_name} 報到成功`);
      mutate(`checkin-participants-${eventId}`);
      setShowModal(false);
      setSelectedParticipant(null);
    } catch (err) {
      console.error('Checkin failed:', err);
      showToast('error', `報到失敗：${err instanceof Error ? err.message : '請重試'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndoCheckin = async (participant: Participant) => {
    if (!participant.attended) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ attended: false })
        .eq('id', participant.id);

      if (error) {
        console.error('Undo error:', error);
        throw new Error(error.message);
      }

      showToast('success', `${participant.participant_name} 已撤銷報到`);
      mutate(`checkin-participants-${eventId}`);
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
          <h1 className="text-xl font-semibold text-text-primary">參與者報到</h1>
          <div className="text-text-secondary">
            <span className="font-medium text-primary">{checkedInCount}</span> / {totalCount}
          </div>
        </div>

        {/* Quick Search with Keypad */}
        <div className="mb-6 p-4 bg-bg-card rounded-xl border border-border-light">
          <label className="block text-sm font-medium text-text-primary mb-3 text-center">
            輸入大使編號快速報到
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
            尚未報到 ({totalCount - checkedInCount})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterMode === 'completed'
                ? 'bg-primary text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            已報到 ({checkedInCount})
          </button>
        </div>

        {/* 努努 */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-text-primary mb-4">
            努努 ({filteredNunus.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredNunus.map((p) => (
              <button
                key={p.id}
                onClick={() => handleCardClick(p)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  p.attended
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
                {p.attended && (
                  <div className="text-xs text-success mt-1">✓ 已報到</div>
                )}
              </button>
            ))}
          </div>
          {filteredNunus.length === 0 && (
            <p className="text-text-muted text-center py-8">
              {filterMode === 'pending' ? '所有努努都已報到' :
               filterMode === 'completed' ? '尚無努努報到' : '沒有努努'}
            </p>
          )}
        </div>

        {/* 校園大使 */}
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">
            校園大使 ({filteredAmbassadors.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredAmbassadors.map((p) => (
              <button
                key={p.id}
                onClick={() => handleCardClick(p)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  p.attended
                    ? 'bg-success/10 border-success/30 opacity-60'
                    : 'bg-bg-card border-border-light hover:border-primary hover:shadow-md'
                }`}
              >
                {p.ambassador_id ? (
                  <div className="text-2xl font-bold text-primary mb-1">
                    #{p.ambassador_id}
                  </div>
                ) : (
                  <div className="text-xs text-text-muted mb-1">無編號</div>
                )}
                <div className="text-sm font-medium text-text-primary truncate">
                  {p.participant_name}
                </div>
                {p.attended && (
                  <div className="text-xs text-success mt-1">✓ 已報到</div>
                )}
              </button>
            ))}
          </div>
          {filteredAmbassadors.length === 0 && (
            <p className="text-text-muted text-center py-8">
              {filterMode === 'pending' ? '所有校園大使都已報到' :
               filterMode === 'completed' ? '尚無校園大使報到' : '沒有校園大使'}
            </p>
          )}
        </div>

        {/* 其他參與者 */}
        {others.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-text-primary mb-4">
              其他 ({filteredOthers.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredOthers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleCardClick(p)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    p.attended
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
                  {p.attended && (
                    <div className="text-xs text-success mt-1">✓ 已報到</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error info */}
        {error && (
          <div className="mt-8 p-4 bg-error/10 rounded-lg text-sm text-error">
            <p className="font-medium mb-2">資料載入失敗</p>
            <p className="text-text-muted">{error.message}</p>
            <button
              onClick={() => mutate(`checkin-participants-${eventId}`)}
              className="mt-3 text-primary hover:underline"
            >
              重新載入
            </button>
          </div>
        )}

        {/* Debug info */}
        {!error && totalCount === 0 && (
          <div className="mt-8 p-4 bg-warning/10 rounded-lg text-sm text-warning">
            <p className="font-medium mb-2">沒有找到參與者</p>
            <p className="text-text-muted">請確認 Supabase RLS 設定，或資料條件：</p>
            <ul className="list-disc list-inside text-text-muted mt-1">
              <li>event_id = &quot;{eventId}&quot;</li>
              <li>attendance_mode = &quot;offline&quot;</li>
            </ul>
          </div>
        )}
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
            {selectedParticipant && selectedParticipant.attended && (
              <Button
                variant="secondary"
                onClick={() => handleUndoCheckin(selectedParticipant)}
                isLoading={isLoading}
                fullWidth
                className="!bg-error/10 !text-error !border-error/30 hover:!bg-error/20"
              >
                撤銷報到
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
            {selectedParticipant.attended && (
              <div className="bg-success/10 text-success text-center py-3 rounded-lg font-medium">
                ✓ 已報到
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

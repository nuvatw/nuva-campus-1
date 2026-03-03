'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { supabase, isSupabaseConfigured } from '@/app/lib/supabase';
import { Button, Modal, useToast } from '@/app/components/ui';
import { SyncIndicator } from '@/app/components/ui/SyncIndicator';
import { PageHeader } from '@/app/components/layout';
import { FadeIn, StaggerChildren } from '@/app/components/motion';
import { createLogger } from '@/app/lib/logger';
import { ParticipantCard } from './ParticipantCard';
import { NumericKeypadEnhanced } from './NumericKeypadEnhanced';
import { CelebrationOverlay } from './CelebrationOverlay';
import { FilterBar, type FilterMode } from './FilterBar';

const log = createLogger('operational');

// =============================================
// Config Types
// =============================================

export interface OperationalConfig {
  /** SWR key prefix */
  swrKeyPrefix: string;
  /** Page title */
  title: string;
  /** Field name for the boolean status (e.g., 'attended' or 'lunch_collected') */
  statusField: 'attended' | 'lunch_collected';
  /** Additional query filters */
  extraFilters?: { field: string; value: unknown }[];
  /** Select fields for Supabase query */
  selectFields: string;
  /** Modal title */
  modalTitle: string;
  /** Action button label */
  actionLabel: string;
  /** Undo button label */
  undoLabel: string;
  /** Completed label shown on cards */
  completedLabel: string;
  /** Toast messages */
  messages: {
    alreadyDone: string;
    success: (name: string) => string;
    undoSuccess: (name: string) => string;
    failed: (msg: string) => string;
    undoFailed: (msg: string) => string;
    notFound: (id: string) => string;
    emptyTitle: string;
    emptyDescription: string;
  };
  /** Labels for filter tabs */
  filterLabels: {
    all: string;
    pending: string;
    completed: string;
  };
  /** Back link */
  backHref: (eventId: string) => string;
  /** Quick search label */
  searchLabel: string;
}

interface Participant {
  id: string;
  participant_name: string;
  participant_email: string;
  ambassador_id: string | null;
  attendance_mode: string;
  member_type: string;
  [key: string]: unknown;
}

// =============================================
// Component
// =============================================

interface OperationalChecklistProps {
  config: OperationalConfig;
}

function LoadingSkeleton() {
  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-bg-secondary rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function OperationalChecklist({ config }: OperationalChecklistProps) {
  const params = useParams();
  const eventId = params.id as string;
  const { showToast } = useToast();

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('pending');
  const [searchId, setSearchId] = useState('');
  const [celebration, setCelebration] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  const swrKey = eventId ? `${config.swrKeyPrefix}-${eventId}` : null;

  const fetchParticipants = useCallback(async (): Promise<Participant[]> => {
    if (!isSupabaseConfigured) {
      log.error('Supabase not configured');
      throw new Error('Supabase 未設定');
    }

    let query = supabase
      .from('event_registrations')
      .select(config.selectFields)
      .eq('event_id', eventId)
      .eq('attendance_mode', 'offline');

    if (config.extraFilters) {
      for (const f of config.extraFilters) {
        query = query.eq(f.field, f.value);
      }
    }

    const { data, error } = await query;
    if (error) {
      log.error('Fetch error', error);
      throw new Error(error.message);
    }
    return (data || []) as unknown as Participant[];
  }, [eventId, config.selectFields, config.extraFilters]);

  const { data: participants, isLoading: dataLoading, isValidating, error } = useSWR(
    swrKey,
    fetchParticipants,
    { refreshInterval: 10000 }
  );

  // Classify participants
  const ambassadors = (participants || [])
    .filter(p => p.member_type === 'ambassador')
    .sort((a, b) => {
      if (a.ambassador_id && b.ambassador_id) {
        return parseInt(a.ambassador_id) - parseInt(b.ambassador_id);
      }
      if (a.ambassador_id) return -1;
      if (b.ambassador_id) return 1;
      return a.participant_name.localeCompare(b.participant_name, 'zh-TW');
    });

  const nunus = (participants || [])
    .filter(p => p.member_type === 'nunu')
    .sort((a, b) => a.participant_name.localeCompare(b.participant_name, 'zh-TW'));

  const others = (participants || [])
    .filter(p => p.member_type !== 'ambassador' && p.member_type !== 'nunu')
    .sort((a, b) => a.participant_name.localeCompare(b.participant_name, 'zh-TW'));

  // Stats
  const totalCount = nunus.length + ambassadors.length;
  const completedCount = [...nunus, ...ambassadors].filter(p => !!p[config.statusField]).length;

  // Filter
  const filterParticipants = (list: Participant[]) => {
    if (filterMode === 'pending') return list.filter(p => !p[config.statusField]);
    if (filterMode === 'completed') return list.filter(p => !!p[config.statusField]);
    return list;
  };

  const filteredAmbassadors = filterParticipants(ambassadors);
  const filteredNunus = filterParticipants(nunus);
  const filteredOthers = filterParticipants(others);

  // Auto-search by ambassador ID
  useEffect(() => {
    if (searchId.length === 3) {
      const found = ambassadors.find(p => p.ambassador_id === searchId);
      if (found) {
        setSelectedParticipant(found);
        setShowModal(true);
        setSearchId('');
      } else {
        showToast('warning', config.messages.notFound(searchId));
        setSearchId('');
      }
    }
  }, [searchId, ambassadors, showToast, config.messages]);

  const handleDigit = (digit: string) => {
    if (searchId.length < 3) setSearchId(prev => prev + digit);
  };

  const handleBackspace = () => {
    setSearchId(prev => prev.slice(0, -1));
  };

  const handleAction = async (participant: Participant) => {
    if (participant[config.statusField]) {
      showToast('warning', config.messages.alreadyDone);
      return;
    }

    // Optimistic UI — update immediately, revert on failure
    setShowModal(false);
    setSelectedParticipant(null);
    setCelebration({ show: true, message: config.messages.success(participant.participant_name) });

    const previousData = participants;
    const optimisticData = (participants || []).map(p =>
      p.id === participant.id ? { ...p, [config.statusField]: true } : p
    );
    mutate(swrKey, optimisticData, false);

    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ [config.statusField]: true })
        .eq('id', participant.id);

      if (error) {
        log.error('Update error', error);
        throw new Error(error.message);
      }

      // Revalidate to confirm server state
      mutate(swrKey);
    } catch (err) {
      log.error('Action failed', err);
      // Revert optimistic update
      mutate(swrKey, previousData, false);
      showToast('error', config.messages.failed(err instanceof Error ? err.message : '請重試'));
    }
  };

  const handleUndo = async (participant: Participant) => {
    if (!participant[config.statusField]) return;

    // Optimistic UI — update immediately, revert on failure
    setShowModal(false);
    setSelectedParticipant(null);

    const previousData = participants;
    const optimisticData = (participants || []).map(p =>
      p.id === participant.id ? { ...p, [config.statusField]: false } : p
    );
    mutate(swrKey, optimisticData, false);
    showToast('success', config.messages.undoSuccess(participant.participant_name));

    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ [config.statusField]: false })
        .eq('id', participant.id);

      if (error) {
        log.error('Undo error', error);
        throw new Error(error.message);
      }

      mutate(swrKey);
    } catch (err) {
      log.error('Undo failed', err);
      // Revert optimistic update
      mutate(swrKey, previousData, false);
      showToast('error', config.messages.undoFailed(err instanceof Error ? err.message : '請重試'));
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

  const filterOptions = [
    { mode: 'all' as const, label: config.filterLabels.all, count: totalCount },
    { mode: 'pending' as const, label: config.filterLabels.pending, count: totalCount - completedCount },
    { mode: 'completed' as const, label: config.filterLabels.completed, count: completedCount },
  ];

  const renderGrid = (list: Participant[], title: string, colsClass: string) => (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-text-primary mb-4">
        {title} ({list.length})
      </h2>
      {list.length > 0 ? (
        <StaggerChildren className={`grid ${colsClass} gap-3`}>
          {list.map((p) => (
            <StaggerChildren.Item key={p.id}>
              <ParticipantCard
                name={p.participant_name}
                email={p.participant_email}
                ambassadorId={p.ambassador_id}
                memberType={p.member_type}
                isCompleted={!!p[config.statusField]}
                completedLabel={config.completedLabel}
                onClick={() => handleCardClick(p)}
              />
            </StaggerChildren.Item>
          ))}
        </StaggerChildren>
      ) : (
        <p className="text-text-muted text-center py-6 text-sm">
          {filterMode === 'pending'
            ? `所有${title}都已完成`
            : filterMode === 'completed'
            ? `尚無${title}完成`
            : `沒有${title}`}
        </p>
      )}
    </div>
  );

  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <PageHeader
            variant="three-column"
            title={config.title}
            back={{ href: config.backHref(eventId), label: '返回' }}
            trailing={
              <div className="flex items-center gap-2 text-text-secondary tabular-nums" aria-live="polite" aria-atomic="true">
                <SyncIndicator isValidating={isValidating && !dataLoading} />
                <span className="font-medium text-primary">{completedCount}</span> / {totalCount}
              </div>
            }
          />
        </FadeIn>

        {/* Quick Search */}
        <FadeIn delay={0.05}>
          <div className="mb-6 p-4 bg-bg-card rounded-xl border border-border-light">
            <label className="block text-sm font-medium text-text-primary mb-3 text-center">
              {config.searchLabel}
            </label>
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-14 h-16 rounded-lg border-2 flex items-center justify-center text-3xl font-bold transition-colors ${
                    searchId[i]
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border-light bg-bg-secondary text-text-muted'
                  }`}
                >
                  {searchId[i] || ''}
                </div>
              ))}
            </div>
            <NumericKeypadEnhanced
              onDigit={handleDigit}
              onBackspace={handleBackspace}
            />
          </div>
        </FadeIn>

        <FilterBar options={filterOptions} activeMode={filterMode} onChange={setFilterMode} />

        {/* Participant grids */}
        {renderGrid(filteredNunus, '努努', 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4')}
        {renderGrid(filteredAmbassadors, '校園大使', 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5')}
        {others.length > 0 && renderGrid(filteredOthers, '其他', 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4')}

        {/* Error */}
        {error && (
          <div className="mt-8 p-4 bg-error/10 rounded-lg text-sm text-error">
            <p className="font-medium mb-2">資料載入失敗</p>
            <p className="text-text-muted">{error.message}</p>
            <button onClick={() => mutate(swrKey)} className="mt-3 text-primary hover:underline">
              重新載入
            </button>
          </div>
        )}

        {/* Empty state */}
        {!error && totalCount === 0 && (
          <div className="mt-8 p-4 bg-warning/10 rounded-lg text-sm text-warning">
            <p className="font-medium mb-2">{config.messages.emptyTitle}</p>
            <p className="text-text-muted">{config.messages.emptyDescription}</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={config.modalTitle}
        showCloseButton={false}
        footer={
          <div className="flex gap-4 w-full">
            <Button variant="secondary" onClick={handleCloseModal} fullWidth>
              返回
            </Button>
            {selectedParticipant && !selectedParticipant[config.statusField] && (
              <Button onClick={() => handleAction(selectedParticipant)} fullWidth>
                {config.actionLabel}
              </Button>
            )}
            {selectedParticipant && !!selectedParticipant[config.statusField] && (
              <Button
                variant="secondary"
                onClick={() => handleUndo(selectedParticipant)}
                fullWidth
                className="!bg-error/10 !text-error !border-error/30 hover:!bg-error/20"
              >
                {config.undoLabel}
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
            {!!selectedParticipant[config.statusField] && (
              <div className="bg-success/10 text-success text-center py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {config.completedLabel}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Celebration */}
      <CelebrationOverlay
        show={celebration.show}
        message={celebration.message}
        onComplete={() => setCelebration({ show: false, message: '' })}
      />
    </div>
  );
}

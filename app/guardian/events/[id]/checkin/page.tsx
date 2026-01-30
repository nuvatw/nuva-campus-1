'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { supabase } from '@/app/lib/supabase';
import { NumericKeypad, CodeInput, Button, Input, LoadingSpinner, useToast } from '@/app/components/ui';

interface Participant {
  id: string;
  participant_name: string;
  participant_email: string;
  checkin_code: string;
  attended: boolean;
}

type ViewState = 'input' | 'confirm' | 'success' | 'error';
type InputMode = 'code' | 'name';

async function fetchStats(eventId: string) {
  const { data } = await supabase
    .from('event_registrations')
    .select('attended')
    .eq('event_id', eventId);

  return {
    total: data?.length || 0,
    checkedIn: data?.filter(r => r.attended).length || 0,
  };
}

function LoadingSkeleton() {
  return (
    <div className="py-8 px-6 min-h-[calc(100vh-120px)]">
      <div className="max-w-md mx-auto text-center">
        <div className="h-8 w-32 bg-bg-secondary rounded mx-auto mb-8 animate-pulse" />
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="w-14 h-16 bg-bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-14 bg-bg-secondary rounded-lg animate-pulse" />
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

  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [viewState, setViewState] = useState<ViewState>('input');
  const [inputMode, setInputMode] = useState<InputMode>('code');
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: stats, isLoading: statsLoading } = useSWR(
    eventId ? `checkin-stats-${eventId}` : null,
    () => fetchStats(eventId),
    { refreshInterval: 10000 }
  );

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

  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 4) {
      handleLookup(fullCode);
    }
  }, [code]);

  const handleLookup = async (checkinCode: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('checkin_code', checkinCode)
        .single();

      if (error || !data) {
        setErrorMessage('查無此編號');
        setViewState('error');
        return;
      }

      if (data.attended) {
        setErrorMessage('此參與者已報到');
        setViewState('error');
        return;
      }

      setParticipant({
        id: data.id,
        participant_name: data.participant_name,
        participant_email: data.participant_email,
        checkin_code: data.checkin_code,
        attended: data.attended,
      });
      setViewState('confirm');
    } catch (err) {
      setErrorMessage('查詢失敗');
      setViewState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!participant) return;

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

      // Revalidate stats
      mutate(`checkin-stats-${eventId}`);
      mutate(`event-stats-${eventId}`);

      setViewState('success');
    } catch (err) {
      setErrorMessage('報到失敗');
      setViewState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCode(['', '', '', '']);
    setParticipant(null);
    setViewState('input');
    setErrorMessage('');
    setSearchName('');
    setSearchResults([]);
  };

  const handleNameSearch = async (name: string) => {
    if (name.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await supabase
        .from('event_registrations')
        .select('id, participant_name, participant_email, checkin_code, attended')
        .eq('event_id', eventId)
        .ilike('participant_name', `%${name}%`)
        .limit(10);

      setSearchResults(data || []);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectParticipant = (selected: Participant) => {
    if (selected.attended) {
      showToast('warning', '此參與者已報到');
      return;
    }
    setParticipant(selected);
    setViewState('confirm');
    setSearchResults([]);
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (inputMode === 'name') {
        handleNameSearch(searchName);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchName, inputMode]);

  if (statsLoading || !stats) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="py-8 px-6 min-h-[calc(100vh-120px)]">
      <div className="max-w-md mx-auto">
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
        </div>

        {/* 輸入狀態 */}
        {viewState === 'input' && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-text-primary mb-6">
              參與者報到
            </h1>

            {/* 模式切換 */}
            <div className="flex justify-center gap-2 mb-6">
              <Button
                variant={inputMode === 'code' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setInputMode('code');
                  setSearchName('');
                  setSearchResults([]);
                }}
              >
                編號報到
              </Button>
              <Button
                variant={inputMode === 'name' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setInputMode('name');
                  setCode(['', '', '', '']);
                }}
              >
                姓名查詢
              </Button>
            </div>

            {inputMode === 'code' ? (
              <>
                <div className="mb-8">
                  <CodeInput code={code} label="請輸入報到編號" />
                </div>

                <NumericKeypad
                  onDigit={handleDigit}
                  onBackspace={handleBackspace}
                />
              </>
            ) : (
              <div className="space-y-4">
                <Input
                  inputSize="lg"
                  placeholder="輸入參與者姓名..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />

                {isSearching && (
                  <div className="py-4">
                    <LoadingSpinner size="sm" label="搜尋中" />
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectParticipant(result)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${
                          result.attended
                            ? 'bg-bg-secondary border-border-light opacity-60'
                            : 'bg-bg-card border-border hover:border-primary'
                        }`}
                        disabled={result.attended}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-text-primary">{result.participant_name}</p>
                            <p className="text-sm text-text-muted">{result.checkin_code}</p>
                          </div>
                          {result.attended ? (
                            <span className="text-success text-sm">已報到</span>
                          ) : (
                            <span className="text-primary text-sm">點擊報到</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!isSearching && searchName.length >= 2 && searchResults.length === 0 && (
                  <p className="text-text-muted py-4">查無此姓名</p>
                )}
              </div>
            )}

            <div className="mt-8 text-text-secondary">
              已報到 <span className="font-medium text-text-primary">{stats.checkedIn}</span> / {stats.total}
            </div>
          </div>
        )}

        {/* 確認狀態 */}
        {viewState === 'confirm' && participant && (
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-text-primary mb-8">
              確認參與者資訊
            </h1>

            <div className="card mb-8">
              <div className="space-y-4 text-left">
                <div>
                  <p className="text-sm text-text-secondary mb-1">報到編號</p>
                  <p className="text-xl font-semibold text-primary tracking-widest">{participant.checkin_code}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">姓名</p>
                  <p className="text-lg text-text-primary">{participant.participant_name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">信箱</p>
                  <p className="text-text-primary">{participant.participant_email}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="secondary" onClick={handleReset} disabled={isLoading} fullWidth>
                取消
              </Button>
              <Button onClick={handleConfirm} isLoading={isLoading} fullWidth>
                確認報到
              </Button>
            </div>
          </div>
        )}

        {/* 成功狀態 */}
        {viewState === 'success' && participant && (
          <div className="text-center py-12" role="alert" aria-live="polite">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-text-primary mb-2">
              報到成功
            </h1>
            <p className="text-xl text-text-secondary mb-8">{participant.participant_name}</p>

            <Button onClick={handleReset}>
              繼續報到
            </Button>
          </div>
        )}

        {/* 錯誤狀態 */}
        {viewState === 'error' && (
          <div className="text-center py-12" role="alert" aria-live="polite">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="text-xl font-semibold text-text-primary mb-2">
              {errorMessage}
            </h1>

            <Button onClick={handleReset} className="mt-8">
              重新輸入
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

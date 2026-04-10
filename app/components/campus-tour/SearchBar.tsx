'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { searchUniversities, universities, type University } from '@/app/data/universities';
import { searchAgendas } from '@/app/data/agendas';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchSelect: (uni: University, agendaTab?: string) => void;
}

export default function SearchBar({
  searchQuery,
  onSearchQueryChange,
  onSearchSelect,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query (150ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search results
  const universityResults = useMemo(() => searchUniversities(debouncedQuery), [debouncedQuery]);
  const agendaResults = useMemo(() => searchAgendas(debouncedQuery), [debouncedQuery]);

  const totalResults = universityResults.length + agendaResults.length;
  const hasResults = totalResults > 0;
  const showDropdown = isOpen && debouncedQuery.trim().length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [debouncedQuery]);

  const handleSelectUniversity = useCallback((uni: University) => {
    onSearchSelect(uni);
    setIsOpen(false);
  }, [onSearchSelect]);

  const handleSelectAgenda = useCallback((universityId: string, tab: string) => {
    const uni = universities.find(u => u.id === universityId);
    if (uni) {
      onSearchSelect(uni, tab);
      setIsOpen(false);
    }
  }, [onSearchSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, totalResults - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < universityResults.length) {
            handleSelectUniversity(universityResults[highlightedIndex]);
          } else {
            const agendaIdx = highlightedIndex - universityResults.length;
            const result = agendaResults[agendaIdx];
            handleSelectAgenda(result.agenda.universityId, result.tab);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const getItemId = (index: number) => `search-result-${index}`;

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto sm:min-w-[320px]">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchQueryChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="搜尋大學或活動..."
          role="combobox"
          aria-expanded={showDropdown && hasResults}
          aria-controls="search-results-listbox"
          aria-activedescendant={highlightedIndex >= 0 ? getItemId(highlightedIndex) : undefined}
          aria-autocomplete="list"
          className="w-full pl-9 pr-8 py-2 bg-white border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchQueryChange('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
            aria-label="清除搜尋"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div
          id="search-results-listbox"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-[50vh] overflow-y-auto"
        >
          {!hasResults && (
            <div className="p-4 text-center text-sm text-text-muted">
              找不到符合的結果
            </div>
          )}

          {/* University results */}
          {universityResults.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-text-muted bg-bg-secondary border-b border-border">
                大學
              </div>
              {universityResults.map((uni, index) => (
                <button
                  key={uni.id}
                  id={getItemId(index)}
                  type="button"
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onClick={() => handleSelectUniversity(uni)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors min-h-[44px] ${
                    highlightedIndex === index ? 'bg-primary/10' : 'hover:bg-bg-secondary'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      <span className="text-xs text-primary mr-1.5 font-mono">{uni.displayCode}</span>
                      {uni.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {uni.city}
                      <span className={`ml-2 px-1 py-0.5 rounded text-[10px] ${
                        uni.type === 'public' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
                      }`}>
                        {uni.type === 'public' ? '公' : '私'}
                      </span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Agenda results */}
          {agendaResults.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-text-muted bg-bg-secondary border-b border-border">
                活動議程
              </div>
              {agendaResults.map((result, idx) => {
                const globalIndex = universityResults.length + idx;
                const tabLabel = { morning: '上午', afternoon: '下午', evening: '晚上', exclusive: '限定' }[result.tab] || result.tab;
                const uniName = universities.find(u => u.id === result.agenda.universityId)?.name || result.agenda.universityId;
                return (
                  <button
                    key={`${result.agenda.universityId}-${result.tab}-${idx}`}
                    id={getItemId(globalIndex)}
                    type="button"
                    role="option"
                    aria-selected={highlightedIndex === globalIndex}
                    onClick={() => handleSelectAgenda(result.agenda.universityId, result.tab)}
                    className={`w-full px-4 py-3 text-left transition-colors min-h-[44px] ${
                      highlightedIndex === globalIndex ? 'bg-primary/10' : 'hover:bg-bg-secondary'
                    }`}
                  >
                    <p className="text-sm font-medium text-text-primary truncate">
                      {result.item.title}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      @ {uniName}（{tabLabel} {result.item.time}）
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

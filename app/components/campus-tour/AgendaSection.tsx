'use client';

import { getAgendaByUniversityId } from '@/app/data/agendas';
import type { University } from '@/app/data/universities';

const tabs = [
  { id: 'morning', label: '上午' },
  { id: 'afternoon', label: '下午' },
  { id: 'evening', label: '晚上' },
  { id: 'exclusive', label: '限定' },
] as const;

export interface AgendaItem {
  time: string;
  title: string;
  description: string;
}

export interface UniversityAgenda {
  universityId: string;
  date: string;
  morning: AgendaItem[];
  afternoon: AgendaItem[];
  evening: AgendaItem[];
  exclusive: AgendaItem[];
}

interface AgendaSectionProps {
  university: University | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

function PlaceholderAgenda() {
  return (
    <div className="py-4 px-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="w-48 h-6 bg-bg-secondary rounded" />
          <div className="w-24 h-4 bg-bg-secondary rounded mt-2" />
        </div>
        <div className="flex gap-2">
          {tabs.map(tab => (
            <span key={tab.id} className="px-4 py-2 rounded-lg text-sm bg-bg-secondary text-text-muted border border-border-light">
              {tab.label}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-bg-secondary/50 border border-border-light rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-6">
            <div className="w-12 h-4 bg-bg-secondary rounded" />
            <div className="flex-1">
              <div className="w-32 h-4 bg-bg-secondary rounded mb-2" />
              <div className="w-full h-3 bg-bg-secondary rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgendaSection({ university, activeTab, onTabChange }: AgendaSectionProps) {
  if (!university) {
    return <PlaceholderAgenda />;
  }

  const agenda = getAgendaByUniversityId(university.id);
  const currentItems = agenda ? agenda[activeTab as keyof Pick<UniversityAgenda, 'morning' | 'afternoon' | 'evening' | 'exclusive'>] || [] : [];

  return (
    <div className="py-4 px-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {university.name} - 活動議程
          </h2>
          {agenda && (
            <p className="text-sm text-text-muted mt-1">{agenda.date}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2" role="tablist" aria-label="議程時段">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-bg-card text-text-secondary border border-border hover:text-text-primary'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agenda content */}
      {!agenda ? (
        <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">Coming Soon</h3>
          <p className="text-text-secondary text-sm">
            {university.shortName}的活動議程即將公佈
          </p>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-muted text-sm">
            此時段尚無安排活動
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentItems.map((item, index) => (
            <div
              key={index}
              className="bg-bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-6"
            >
              <div className="shrink-0">
                <span className="font-mono text-sm text-primary font-semibold">
                  {item.time}
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-text-primary mb-1">
                  {item.title}
                </h4>
                <p className="text-sm text-text-secondary">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { nunuEvents } from '@/app/data/nunu-events';

interface ContentSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

const sections: ContentSection[] = [
  { id: 'yourator-info', title: 'Yourator 活動資訊', subtitle: 'Event Info', icon: '🎪', color: 'sky' },
  { id: 'schedule', title: '活動細流', subtitle: 'Schedule', icon: '⏰', color: 'rose' },
  { id: 'irreplaceable-wall', title: '不可取代牆', subtitle: 'Irreplaceable Wall', icon: '🧱', color: 'emerald' },
  { id: 'ai-time-capsule', title: 'AI 時光膠囊', subtitle: 'AI Time Capsule', icon: '💊', color: 'violet' },
  { id: 'qa', title: 'Q&A', subtitle: 'Questions & Answers', icon: '🙋', color: 'amber' },
];

const colorClasses: Record<string, { bg: string; text: string; activeBg: string }> = {
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', activeBg: 'bg-sky-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', activeBg: 'bg-rose-500' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', activeBg: 'bg-emerald-500' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', activeBg: 'bg-violet-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', activeBg: 'bg-amber-500' },
};

export default function NunuEventRunPage() {
  const params = useParams();
  const id = params.id as string;
  const event = nunuEvents.find((e) => e.id === id);

  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContents() {
      const files = [
        'yourator-info.md',
        'schedule.md',
        'irreplaceable-wall.md',
        'ai-time-capsule.md',
        'qa.md',
      ];

      const results: Record<string, string> = {};

      for (const file of files) {
        try {
          const res = await fetch(`/api/nunu-content/${id}/${file}`);
          if (res.ok) {
            results[file.replace('.md', '')] = await res.text();
          } else {
            results[file.replace('.md', '')] = `# ${file.replace('.md', '')}\n\n*內容尚未設定*`;
          }
        } catch {
          results[file.replace('.md', '')] = `# ${file.replace('.md', '')}\n\n*內容尚未設定*`;
        }
      }

      setContents(results);
      setLoading(false);
    }

    fetchContents();
  }, [id]);

  if (!event) {
    notFound();
  }

  const currentSection = sections.find((s) => s.id === activeSection)!;
  const colors = colorClasses[currentSection.color];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/nunu/events/${id}`}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ←
            </Link>
            <div>
              <p className="text-[10px] text-rose-500 tracking-widest uppercase font-medium">Run Mode</p>
              <h1 className="text-base font-semibold text-slate-800">{event.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-medium rounded-full border border-rose-100">
              執行中
            </span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 sticky top-[57px] z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 sm:gap-2 py-2 overflow-x-auto scrollbar-hide justify-center sm:justify-start">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              const sectionColors = colorClasses[section.color];

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap
                    transition-all duration-300 ease-out
                    ${isActive
                      ? `${sectionColors.activeBg} text-white shadow-lg`
                      : `${sectionColors.bg} ${sectionColors.text} hover:opacity-80`
                    }
                  `}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="hidden sm:inline">{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-slate-400">載入中...</div>
            </div>
          ) : (
            <div
              key={activeSection}
              className="animate-in fade-in slide-in-from-right-4 duration-300"
            >
              {/* Section Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                  <span className="text-2xl">{currentSection.icon}</span>
                </div>
                <div>
                  <p className={`text-xs ${colors.text} tracking-widest uppercase font-medium`}>
                    {currentSection.subtitle}
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{currentSection.title}</h2>
                </div>
              </div>

              {/* Markdown Content */}
              <article className="prose prose-lg max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {contents[activeSection] || '*內容尚未設定*'}
                </ReactMarkdown>
              </article>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

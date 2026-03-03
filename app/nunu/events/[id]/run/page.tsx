'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { m, AnimatePresence } from 'motion/react';
import { nunuEvents } from '@/app/data/nunu-events';
import { FadeIn, useReducedMotion } from '@/app/components/motion';
import { Badge } from '@/app/components/ui';
import { spring } from '@/app/styles/tokens';

interface ContentSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

interface ScheduleTab {
  id: string;
  title: string;
  icon: string;
  file: string;
}

const sections: ContentSection[] = [
  { id: 'yourator-info', title: 'Yourator 活動資訊', subtitle: 'Event Info', icon: '🎪', color: 'sky' },
  { id: 'schedule', title: '活動細流', subtitle: 'Schedule', icon: '⏰', color: 'rose' },
  { id: 'irreplaceable-wall', title: '不可取代牆', subtitle: 'Irreplaceable Wall', icon: '🧱', color: 'emerald' },
  { id: 'ai-time-capsule', title: 'AI 時光膠囊', subtitle: 'AI Time Capsule', icon: '💊', color: 'violet' },
  { id: 'qa', title: 'Q&A', subtitle: 'Questions & Answers', icon: '🙋', color: 'amber' },
];

const scheduleTabs: ScheduleTab[] = [
  { id: 'morning', title: '上午', icon: '🌅', file: 'schedule-morning.md' },
  { id: 'afternoon', title: '下午', icon: '☀️', file: 'schedule-afternoon.md' },
  { id: 'evening', title: '晚上', icon: '🌙', file: 'schedule-evening.md' },
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
  const prefersReduced = useReducedMotion();

  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [activeScheduleTab, setActiveScheduleTab] = useState(scheduleTabs[0].id);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rowIdCounter = useRef(0);

  // Reset active row on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (activeRowId) setActiveRowId(null);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeRowId]);

  // Reset active row when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('tr')) setActiveRowId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Reset row counter when content changes
  useEffect(() => {
    rowIdCounter.current = 0;
  }, [activeSection, activeScheduleTab]);

  // Update indicator position when active section changes
  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = sections.findIndex(s => s.id === activeSection);
      const activeButton = buttonRefs.current[activeIndex];
      if (activeButton && navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        setIndicatorStyle({
          left: buttonRect.left - navRect.left,
          width: buttonRect.width,
        });
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeSection]);

  useEffect(() => {
    async function fetchContents() {
      const files = [
        'yourator-info.md',
        'schedule-morning.md',
        'schedule-afternoon.md',
        'schedule-evening.md',
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

  if (!event) notFound();

  const currentSection = sections.find((s) => s.id === activeSection)!;
  const colors = colorClasses[currentSection.color];

  const getDisplayContent = () => {
    if (activeSection === 'schedule') {
      const scheduleFile = `schedule-${activeScheduleTab}`;
      return contents[scheduleFile] || '*內容尚未設定*';
    }
    return contents[activeSection] || '*內容尚未設定*';
  };

  // Content key for AnimatePresence — changes when section or schedule tab changes
  const contentKey = activeSection === 'schedule' ? `${activeSection}-${activeScheduleTab}` : activeSection;

  // Custom markdown components for table row hover + zebra striping
  const markdownComponents: Components = {
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto rounded-xl border border-border my-4">
        <table className="w-full border-collapse" {...props}>{children}</table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-bg-secondary" {...props}>{children}</thead>
    ),
    th: ({ children, ...props }) => (
      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary border-b border-border" {...props}>{children}</th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-3 text-sm text-text-secondary border-b border-border-light" {...props}>{children}</td>
    ),
    tr: ({ children, ...props }) => {
      const rowId = `row-${rowIdCounter.current++}`;
      const isActive = activeRowId === rowId;
      const isHeader = props.node?.position?.start.line === 1;

      if (isHeader) return <tr {...props}>{children}</tr>;

      const rowNum = rowIdCounter.current;
      const isEven = rowNum % 2 === 0;

      return (
        <tr
          {...props}
          onClick={() => setActiveRowId(isActive ? null : rowId)}
          className={`
            transition-colors duration-200 cursor-pointer
            hover:bg-primary-50
            ${isActive ? 'bg-primary-50/80' : isEven ? 'bg-bg-secondary/50' : ''}
          `}
        >
          {children}
        </tr>
      );
    },
  };

  return (
    <div className="min-h-screen bg-bg-card flex flex-col">
      {/* Header */}
      <FadeIn direction="down" offset={8}>
        <header className="bg-bg-card border-b border-border sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/nunu/events/${id}`}
                className="text-text-muted hover:text-text-secondary hover:-translate-x-1 transition-all duration-200"
              >
                ←
              </Link>
              <div>
                <p className="text-[10px] text-error tracking-widest uppercase font-medium">Run Mode</p>
                <h1 className="text-base font-semibold text-text-primary">{event.title}</h1>
              </div>
            </div>
            <Badge variant="error" dot size="sm">執行中</Badge>
          </div>
        </header>
      </FadeIn>

      {/* Navigation Tabs */}
      <nav className="bg-bg-card border-b border-border sticky top-[57px] z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div
            ref={navRef}
            className="relative inline-flex bg-bg-secondary rounded-xl p-1 w-full sm:w-auto"
          >
            {/* Sliding Indicator — uses motion layoutId for smooth transitions */}
            <m.div
              className="absolute top-1 bottom-1 rounded-lg bg-bg-card shadow-md"
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={prefersReduced ? { duration: 0 } : spring.gentle}
            />

            {sections.map((section, index) => {
              const isActive = activeSection === section.id;
              const sectionColors = colorClasses[section.color];

              return (
                <button
                  key={section.id}
                  ref={(el) => { buttonRefs.current[index] = el; }}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    relative z-10 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                    transition-colors duration-200
                    flex-1 sm:flex-none
                    ${isActive ? sectionColors.text : 'text-text-secondary hover:text-text-primary'}
                  `}
                >
                  <span className={`text-lg transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                    {section.icon}
                  </span>
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
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-border" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <div className="text-text-muted animate-pulse">載入中...</div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <m.div
                key={contentKey}
                initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
                animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
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
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">{currentSection.title}</h2>
                  </div>
                </div>

                {/* Schedule Sub-tabs */}
                {activeSection === 'schedule' && (
                  <div className="flex gap-2 mb-6">
                    {scheduleTabs.map((tab) => {
                      const isTabActive = activeScheduleTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveScheduleTab(tab.id)}
                          className={`
                            relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200
                            ${isTabActive
                              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            }
                          `}
                        >
                          <span>{tab.icon}</span>
                          <span>{tab.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Markdown Content */}
                <article className="prose prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-a:text-primary">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {getDisplayContent()}
                  </ReactMarkdown>
                </article>
              </m.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}

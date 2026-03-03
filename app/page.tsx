'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'motion/react';
import HeroSection from './components/campus-tour/HeroSection';
import CitySelector from './components/campus-tour/CitySelector';
import UniversitySelector from './components/campus-tour/UniversitySelector';
import AgendaSection from './components/campus-tour/AgendaSection';
import StoryProgressSection from './components/campus-tour/StoryProgressSection';
import JoinJourney from './components/campus-tour/JoinJourney';
import Footer from './components/ui/Footer';
import { FadeIn } from './components/motion';
import { universities, cityOrder, regionNames, type University } from './data/universities';

const regionOrder = ['north', 'central', 'south', 'east'] as const;

interface StepSectionProps {
  step: number;
  title: string;
  locked?: boolean;
  isNextStep?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function StepSection({ step, title, locked, isNextStep, hint, children }: StepSectionProps) {
  return (
    <section className="px-4 sm:px-6 mb-4">
      <div className={`
        max-w-5xl mx-auto rounded-2xl border-2 transition-all duration-500 overflow-hidden
        ${locked
          ? 'border-neutral-200/60 bg-neutral-50/30'
          : isNextStep
            ? 'border-primary/30 bg-bg-card shadow-elevation-2 animate-section-glow'
            : 'border-border bg-bg-card shadow-elevation-1'
        }
      `}>
        {/* Section header */}
        <div className={`
          flex items-center gap-3 px-5 py-3.5
          ${locked ? 'border-b border-neutral-200/40' : 'border-b border-border/50'}
        `}>
          {/* Step indicator */}
          <span className={`
            relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-500
            ${locked
              ? 'bg-neutral-200 text-neutral-400'
              : isNextStep
                ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-sm shadow-primary/30'
                : 'bg-primary text-white'
            }
          `}>
            {!locked && !isNextStep ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step
            )}
            {isNextStep && (
              <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
            )}
          </span>

          <h2 className={`text-sm font-semibold transition-colors duration-500 ${locked ? 'text-neutral-400' : 'text-text-primary'}`}>
            {title}
          </h2>

          {locked && (
            <svg className="w-4 h-4 text-neutral-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
          {!locked && !isNextStep && (
            <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              完成
            </span>
          )}
        </div>

        {/* Content with lock overlay */}
        <div className="relative">
          <m.div
            initial={false}
            animate={{
              opacity: locked ? 0.2 : 1,
              filter: locked ? 'blur(1px)' : 'blur(0px)',
            }}
            transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
            className={locked ? 'pointer-events-none select-none' : ''}
          >
            {children}
          </m.div>

          <AnimatePresence>
            {locked && hint && (
              <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-bg-card/90 backdrop-blur-sm shadow-elevation-2 border border-border-light">
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm text-text-muted font-medium">{hint}</span>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function CampusTourContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedRegion, setSelectedRegion] = useState<string | null>(() => {
    const region = searchParams.get('region');
    if (region) return region;
    const uniId = searchParams.get('uni');
    if (uniId) {
      const uni = universities.find(u => u.id === uniId);
      if (uni) return uni.region;
    }
    const city = searchParams.get('city');
    if (city) {
      const cityInfo = cityOrder.find(c => c.name === city);
      if (cityInfo) return cityInfo.region;
    }
    return null;
  });
  const [selectedCity, setSelectedCity] = useState<string | null>(() => {
    const city = searchParams.get('city');
    if (city) return city;
    const uniId = searchParams.get('uni');
    if (uniId) {
      const uni = universities.find(u => u.id === uniId);
      if (uni) return uni.city;
    }
    return null;
  });
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(() => {
    const uniId = searchParams.get('uni');
    return uniId ? universities.find(u => u.id === uniId) || null : null;
  });
  const [activeAgendaTab, setActiveAgendaTab] = useState<string>('morning');
  const [searchQuery, setSearchQuery] = useState('');

  const updateURL = useCallback((region: string | null, city: string | null, uni: University | null) => {
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    if (city) params.set('city', city);
    if (uni) params.set('uni', uni.id);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '/', { scroll: false });
  }, [router]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }
    updateURL(selectedRegion, selectedCity, selectedUniversity);
  }, [selectedRegion, selectedCity, selectedUniversity, updateURL, mounted]);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setSelectedUniversity(null);
    setActiveAgendaTab('morning');
  };

  const handleSelectRegion = (region: string) => {
    if (region === selectedRegion) return;
    setSelectedRegion(region);
    setSelectedCity(null);
    setSelectedUniversity(null);
    setActiveAgendaTab('morning');
  };

  const handleSelectUniversity = (uni: University) => {
    setSelectedUniversity(prev => prev?.id === uni.id ? null : uni);
    setActiveAgendaTab('morning');
  };

  const handleSearchSelect = (uni: University, agendaTab?: string) => {
    setSelectedRegion(uni.region);
    setSelectedCity(uni.city);
    setSelectedUniversity(uni);
    if (agendaTab) setActiveAgendaTab(agendaTab);
    setSearchQuery('');
  };

  return (
    <>
      <HeroSection
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSelect={handleSearchSelect}
      />

      <FadeIn delay={0.1}>
      <div className="py-6 space-y-0">
        {/* Step 1: 選擇區域 */}
        <StepSection
          step={1}
          title="選擇區域"
          isNextStep={!selectedRegion}
        >
          <div className="py-4 px-5">
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="地區選擇">
              {regionOrder.map(region => (
                <button
                  key={region}
                  type="button"
                  role="tab"
                  aria-selected={selectedRegion === region}
                  onClick={() => handleSelectRegion(region)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${selectedRegion === region
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : !selectedRegion
                        ? 'bg-bg-secondary text-text-secondary border border-primary/30 hover:bg-primary/5 hover:border-primary/50'
                        : 'bg-bg-secondary text-text-secondary border border-border hover:text-text-primary hover:border-primary/40'
                    }
                  `}
                >
                  {regionNames[region]}
                </button>
              ))}
            </div>
            {!selectedRegion && (
              <p className="text-xs text-primary/60 mt-3 animate-pulse">
                👆 點選上方區域開始探索
              </p>
            )}
          </div>
        </StepSection>

        {/* Step 2: 選擇城市 */}
        <StepSection
          step={2}
          title="選擇城市"
          locked={!selectedRegion}
          isNextStep={!!selectedRegion && !selectedCity}
          hint="請先選擇區域"
        >
          <CitySelector
            selectedRegion={selectedRegion || 'north'}
            selectedCity={selectedCity}
            onSelectCity={handleSelectCity}
          />
        </StepSection>

        {/* Step 3: 選擇學校 */}
        <StepSection
          step={3}
          title="選擇學校"
          locked={!selectedCity}
          isNextStep={!!selectedCity && !selectedUniversity}
          hint="請先選擇城市"
        >
          <UniversitySelector
            selectedCity={selectedCity}
            selectedUniversity={selectedUniversity}
            onSelectUniversity={handleSelectUniversity}
          />
        </StepSection>

        {/* Step 4: 活動議程 */}
        <StepSection
          step={4}
          title="活動議程"
          locked={!selectedUniversity}
          isNextStep={!!selectedUniversity}
          hint="請先選擇學校"
        >
          <AgendaSection
            university={selectedUniversity}
            activeTab={activeAgendaTab}
            onTabChange={setActiveAgendaTab}
          />
        </StepSection>

        {/* Step 5: 故事進度 */}
        <StepSection
          step={5}
          title="故事進度"
        >
          <StoryProgressSection />
        </StepSection>
      </div>
      </FadeIn>

      <JoinJourney />

      <Footer />
    </>
  );
}

export default function CampusTourPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Suspense>
        <CampusTourContent />
      </Suspense>
    </div>
  );
}

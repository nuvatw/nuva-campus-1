'use client';

import useSWR from 'swr';
import MissionGrid from '@/app/components/ui/MissionGrid';
import WorkshopCard from '@/app/components/ui/WorkshopCard';
import AmbassadorStatus from '@/app/components/ui/AmbassadorStatus';
import ContactCard from '@/app/components/ui/ContactCard';
import Footer from '@/app/components/ui/Footer';
import { SkeletonEventCard } from '@/app/components/ui/Skeleton';
import { workshopsService } from '@/app/services/workshops.service';
import { formatWorkshopTime } from '@/app/transforms/workshop';
import { PageHeader } from '@/app/components/layout';
import { FadeIn, StaggerChildren } from '@/app/components/motion';

async function fetchWorkshops() {
  const workshops = await workshopsService.getAll();
  return workshops.map(workshop => ({
    id: workshop.id,
    title: workshop.title,
    type: workshop.type as 'online' | 'offline',
    date: workshop.date,
    time: formatWorkshopTime(workshop.start_time, workshop.end_time),
    location: workshop.location || '',
    description: workshop.description || '',
    tallyFormId: workshop.tally_form_id || undefined,
  }));
}

export default function AmbassadorsPage() {
  const { data: workshops, isLoading } = useSWR('ambassador-workshops', fetchWorkshops, {
    revalidateOnFocus: false,
  });

  return (
    <div className="pb-12">
      {/* Header — warm gradient background */}
      <section className="py-12 px-6 bg-gradient-to-b from-primary/5 to-transparent">
        <PageHeader title="大使們" subtitle="歡迎回來，繼續你的影響力之旅" variant="centered" />
      </section>

      {/* Mission Grid — hero element, mission-first layout */}
      <div className="bg-bg-card border-y border-border">
        <MissionGrid />
      </div>

      {/* Workshops */}
      <section className="py-16 px-6 bg-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl font-bold text-text-primary mb-8 text-center relative pb-4">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                工作坊
              </span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary to-accent rounded" aria-hidden="true" />
            </h2>
          </FadeIn>

          {isLoading ? (
            <div className="grid gap-6">
              <SkeletonEventCard />
              <SkeletonEventCard />
            </div>
          ) : workshops && workshops.length > 0 ? (
            <StaggerChildren className="grid gap-6">
              {workshops.map(workshop => (
                <StaggerChildren.Item key={workshop.id}>
                  <WorkshopCard workshop={workshop} />
                </StaggerChildren.Item>
              ))}
            </StaggerChildren>
          ) : (
            <div className="text-center py-12 text-text-muted">
              目前沒有工作坊
            </div>
          )}
        </div>
      </section>

      {/* Ambassador Survival Status */}
      <div className="bg-bg-card border-y border-border">
        <AmbassadorStatus />
      </div>

      {/* Contact */}
      <div className="bg-bg-secondary">
        <ContactCard />
      </div>

      <Footer />
    </div>
  );
}

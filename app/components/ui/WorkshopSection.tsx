'use client';

import { workshops } from '@/app/data/workshops';
import { FadeIn, StaggerChildren } from '@/app/components/motion';
import WorkshopCard from './WorkshopCard';

export default function WorkshopSection() {
  const activeWorkshops = workshops.filter((w) => w.tallyFormId);

  return (
    <section className="bg-bg-primary py-20 px-8">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl font-bold text-text-primary mb-10 text-center relative pb-4">
            工作坊
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary to-accent rounded" />
          </h2>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeWorkshops.map((workshop) => (
            <StaggerChildren.Item key={workshop.id}>
              <WorkshopCard workshop={workshop} />
            </StaggerChildren.Item>
          ))}
        </StaggerChildren>

        {activeWorkshops.length === 0 && (
          <p className="text-center text-text-muted py-8">目前沒有開放報名的工作坊</p>
        )}
      </div>
    </section>
  );
}

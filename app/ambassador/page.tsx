'use client';

import useSWR from 'swr';
import AmbassadorStatus from '@/app/components/ui/AmbassadorStatus';
import MissionGrid from '@/app/components/ui/MissionGrid';
import WorkshopCard from '@/app/components/ui/WorkshopCard';
import ContactCard from '@/app/components/ui/ContactCard';
import Footer from '@/app/components/ui/Footer';
import { SkeletonEventCard } from '@/app/components/ui/Skeleton';
import { workshopsService } from '@/app/services/workshops.service';
import {
  transformWorkshopForDisplay,
  formatWorkshopTime,
} from '@/app/transforms/workshop';

// 使用 transform 轉換資料庫格式為前端格式
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

export default function AmbassadorPage() {
  const { data: workshops, isLoading } = useSWR('ambassador-workshops', fetchWorkshops, {
    revalidateOnFocus: false,
  });

  return (
    <div className="pb-12">
      {/* Header */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-semibold text-text-primary mb-3">
            校園大使專區
          </h1>
          <p className="text-text-secondary">
            歡迎回來，繼續你的影響力之旅
          </p>
        </div>
      </section>

      {/* 任務 */}
      <div className="bg-bg-card border-y border-border-light">
        <MissionGrid />
      </div>

      {/* 工作坊 */}
      <section className="py-16 px-6 bg-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-medium text-text-primary mb-8 text-center">
            工作坊
          </h2>
          <div className="grid gap-6">
            {isLoading ? (
              <>
                <SkeletonEventCard />
                <SkeletonEventCard />
              </>
            ) : workshops && workshops.length > 0 ? (
              workshops.map(workshop => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))
            ) : (
              <div className="text-center py-12 text-text-muted">
                目前沒有工作坊
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 校園大使存活狀態 */}
      <div className="bg-bg-card border-y border-border-light">
        <AmbassadorStatus />
      </div>

      {/* 聯繫我們 */}
      <div className="bg-bg-secondary">
        <ContactCard />
      </div>

      <Footer />
    </div>
  );
}

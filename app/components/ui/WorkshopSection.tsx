'use client';

import { workshops } from '@/app/data/workshops';
import WorkshopCard from './WorkshopCard';

export default function WorkshopSection() {
  // 只顯示有 tallyFormId 的工作坊（即開放報名的）
  const activeWorkshops = workshops.filter((w) => w.tallyFormId);

  return (
    <section className="bg-white py-20 px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center relative pb-4">
          🎯 工作坊
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeWorkshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>

        {activeWorkshops.length === 0 && (
          <p className="text-center text-gray-400 py-8">目前沒有開放報名的工作坊</p>
        )}
      </div>
    </section>
  );
}
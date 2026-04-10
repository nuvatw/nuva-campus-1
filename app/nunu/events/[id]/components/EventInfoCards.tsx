'use client';

import { FadeIn } from '@/app/components/motion';
import type { NunuEventRegistration } from '@/app/types/nunu';

interface EventInfoCardsProps {
  registrations: NunuEventRegistration[];
}

function DressCodeCard() {
  return (
    <FadeIn delay={0.25} className="col-span-12 md:col-span-6">
      <div className="bg-bg-card rounded-2xl p-5 border border-border hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] text-violet-500 tracking-widest uppercase font-medium">Dress Code</p>
            <h3 className="text-base font-semibold text-text-primary mt-0.5">服裝儀容</h3>
          </div>
          <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center group-hover:bg-violet-100 transition-colors">
            <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-bg-secondary hover:bg-violet-50 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-text-primary">下身穿著</p>
              <p className="text-xs text-text-secondary">黑色長褲或長裙（沒有黑色就穿深色）</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-bg-secondary hover:bg-violet-50 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-text-primary">鞋子</p>
              <p className="text-xs text-text-secondary">不可露出腳趾頭</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-success-light hover:bg-success/15 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-success mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-success">我們提供</p>
              <p className="text-xs text-success/80">短袖衣服、襪子</p>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function WeatherTipsCard() {
  return (
    <FadeIn delay={0.3} className="col-span-12 md:col-span-6">
      <div className="bg-bg-card rounded-2xl p-5 border border-border hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 group h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] text-orange-500 tracking-widest uppercase font-medium">Weather Tips</p>
            <h3 className="text-base font-semibold text-text-primary mt-0.5">保暖建議</h3>
          </div>
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-bg-secondary hover:bg-orange-50 rounded-xl transition-colors">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 shrink-0" />
            <p className="text-sm text-text-secondary">室內怕冷的人，裡面可以多穿一件<span className="font-medium text-orange-600">薄長袖</span></p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-bg-secondary hover:bg-orange-50 rounded-xl transition-colors">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 shrink-0" />
            <p className="text-sm text-text-secondary">晚上有<span className="font-medium text-orange-600">戶外野餐</span>，請準備防風措施</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0" />
            <p className="text-sm text-orange-700 font-medium">建議攜帶：防風外套、毛帽</p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function DietaryNotesCard({ registrations }: { registrations: NunuEventRegistration[] }) {
  const dietaryList = registrations.filter((r) => r.dietary_restrictions);

  if (dietaryList.length === 0) return null;

  return (
    <FadeIn delay={0.35} className="col-span-12">
      <div className="bg-bg-card rounded-2xl p-5 border border-border hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] text-error tracking-widest uppercase font-medium">Dietary Notes</p>
            <h3 className="text-base font-semibold text-text-primary mt-0.5">上哲點餐中</h3>
          </div>
          <span className="text-sm text-text-muted tabular-nums">{dietaryList.length} 人</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {dietaryList.map((reg) => (
            <div
              key={reg.id}
              className="flex items-center gap-3 p-3 bg-error-light hover:bg-error/15 rounded-xl transition-colors"
            >
              <span className="text-sm font-medium text-error">{reg.english_name}</span>
              <span className="text-error/30">·</span>
              <span className="text-sm text-error/80">{reg.dietary_restrictions}</span>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

export function EventInfoCards({ registrations }: EventInfoCardsProps) {
  return (
    <>
      <DressCodeCard />
      <WeatherTipsCard />
      <DietaryNotesCard registrations={registrations} />
    </>
  );
}

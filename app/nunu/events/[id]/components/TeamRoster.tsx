'use client';

import { m, AnimatePresence } from 'motion/react';
import { FadeIn, StaggerChildren, useReducedMotion } from '@/app/components/motion';
import { spring } from '@/app/styles/tokens';
import type { NunuEventRegistration } from '@/app/types/nunu';

interface TeamRosterProps {
  registrations: NunuEventRegistration[];
}

function ParticipantGridCard({ reg }: { reg: NunuEventRegistration }) {
  const prefersReduced = useReducedMotion();

  const motionProps = prefersReduced
    ? {}
    : {
        whileHover: { y: -2, boxShadow: '0 4px 8px -2px rgba(28, 25, 23, 0.08)' },
        whileTap: { scale: 0.97 },
        transition: spring.tactile,
      };

  return (
    <m.div
      layout
      className="bg-bg-secondary hover:bg-primary-50 border border-transparent hover:border-primary-200 rounded-xl p-3 transition-colors duration-200 cursor-default"
      {...motionProps}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center text-xs font-bold text-primary shadow-sm">
          {String(reg.registration_number).padStart(2, '0')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{reg.english_name}</p>
          <p className="text-[10px] text-text-muted">{reg.shirt_size}</p>
        </div>
      </div>
    </m.div>
  );
}

export function TeamRoster({ registrations }: TeamRosterProps) {
  return (
    <FadeIn delay={0.15} className="col-span-12 lg:col-span-8">
      <div className="bg-bg-card rounded-2xl p-5 border border-border hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-text-muted tracking-widest uppercase font-medium">Team Roster</p>
            <h3 className="text-base font-semibold text-text-primary mt-0.5">已報名成員</h3>
          </div>
          <span className="text-sm text-text-muted tabular-nums">{registrations.length} 人</span>
        </div>

        {registrations.length > 0 ? (
          <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <AnimatePresence mode="popLayout">
              {registrations.map((reg) => (
                <StaggerChildren.Item key={reg.id}>
                  <ParticipantGridCard reg={reg} />
                </StaggerChildren.Item>
              ))}
            </AnimatePresence>
          </StaggerChildren>
        ) : (
          <div className="text-center py-12 text-text-muted">
            <svg className="w-10 h-10 mx-auto mb-3 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <p className="text-sm">還沒有人報名，快來成為第一個！</p>
          </div>
        )}
      </div>
    </FadeIn>
  );
}

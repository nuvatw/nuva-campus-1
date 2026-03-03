'use client';

import { useState } from 'react';
import { SupportFormModal } from '@/app/components/shared/SupportFormModal';
import { Button } from '@/app/components/ui';
import { FadeIn } from '@/app/components/motion';
import type { SupportType } from '@/app/types/supporter';

export default function JoinJourney() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: SupportType;
  }>({ isOpen: false, type: 'attend' });

  const handleOpenModal = (type: SupportType) => {
    setModalState({ isOpen: true, type });
  };

  const handleCloseModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSuccess = () => {
    // Could add celebration animation here
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-primary-50/30 to-bg-primary" />

      <div className="relative max-w-4xl mx-auto text-center">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4 font-display">
            加入旅程
          </h2>
          <p className="text-text-secondary mb-10 max-w-xl mx-auto leading-relaxed">
            無論你想提供幫助或參加活動，都歡迎加入我們的校園巡迴之旅
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => handleOpenModal('help')}
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
              }
            >
              我可以幫忙
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleOpenModal('attend')}
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
            >
              我想參加活動
            </Button>
          </div>
        </FadeIn>
      </div>

      <SupportFormModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        supportType={modalState.type}
        onSuccess={handleSuccess}
      />
    </section>
  );
}

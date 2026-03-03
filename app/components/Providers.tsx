'use client';

import { ToastProvider } from '@/app/components/ui/Toast';
import { MotionProvider } from '@/app/components/motion';
import { RouteProgress } from '@/app/components/ui/RouteProgress';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MotionProvider>
      <RouteProgress />
      <ToastProvider>{children}</ToastProvider>
    </MotionProvider>
  );
}

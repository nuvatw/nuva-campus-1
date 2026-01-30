'use client';

import { ToastProvider } from '@/app/components/ui/Toast';
import type { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>;
}

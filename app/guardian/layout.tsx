'use client';

import { SectionLayout } from '@/app/components/layout';

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionLayout sectionLabel="守護者專區" backHref="/" backLabel="返回首頁">
      {children}
    </SectionLayout>
  );
}

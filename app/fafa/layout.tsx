'use client';

import { SectionLayout } from '@/app/components/layout';

export default function FafaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionLayout sectionLabel="法法專區" backHref="/" backLabel="返回首頁">
      {children}
    </SectionLayout>
  );
}

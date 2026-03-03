'use client';

import { SectionLayout } from '@/app/components/layout';

export default function NunuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionLayout sectionLabel="努努專區" backHref="/" backLabel="返回首頁">
      {children}
    </SectionLayout>
  );
}

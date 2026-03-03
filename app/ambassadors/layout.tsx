'use client';

import { SectionLayout } from '@/app/components/layout';

export default function AmbassadorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionLayout sectionLabel="大使們" backHref="/" backLabel="返回首頁" showSectionHeader={false}>
      {children}
    </SectionLayout>
  );
}

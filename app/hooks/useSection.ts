'use client';

import { usePathname } from 'next/navigation';

export interface SectionConfig {
  id: string;
  label: string;
  shortLabel: string;
  basePath: string;
  backHref: string;
}

const SECTION_MAP: Record<string, SectionConfig> = {
  ambassadors: {
    id: 'ambassadors',
    label: '大使們',
    shortLabel: '大使',
    basePath: '/ambassadors',
    backHref: '/',
  },
  guardian: {
    id: 'guardian',
    label: '守護者專區',
    shortLabel: '守護者',
    basePath: '/guardian',
    backHref: '/',
  },
  nunu: {
    id: 'nunu',
    label: '努努專區',
    shortLabel: '努努',
    basePath: '/nunu',
    backHref: '/',
  },
  fafa: {
    id: 'fafa',
    label: '法法專區',
    shortLabel: '法法',
    basePath: '/fafa',
    backHref: '/',
  },
};

const HOME_SECTION: SectionConfig = {
  id: 'home',
  label: '首頁',
  shortLabel: '首頁',
  basePath: '/',
  backHref: '/',
};

export function useSection() {
  const pathname = usePathname();

  const sectionKey = Object.keys(SECTION_MAP).find((key) =>
    pathname.startsWith(`/${key}`)
  );

  const section = sectionKey ? SECTION_MAP[sectionKey] : HOME_SECTION;
  const isDeep = sectionKey ? pathname !== section.basePath : false;

  return { section, isDeep, pathname };
}

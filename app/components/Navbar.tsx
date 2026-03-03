'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { OptimizedImage } from './ui';
import { useSection } from '@/app/hooks/useSection';

const navLinks = [
  { href: '/', label: '校園巡迴' },
  { href: '/ambassadors', label: '大使們' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { section } = useSection();
  const inOperationalArea = section.id !== 'home' && section.id !== 'ambassadors';

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Auto-close on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Body scroll lock
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16">
          {/* Left spacer — matches right column for centering */}
          <div />

          {/* Centered Logo */}
          <Link href="/" className="flex items-center justify-center shrink-0">
            <OptimizedImage
              src="/nuva logo.png"
              alt="nuva"
              width={32}
              height={32}
              className="object-contain"
              priority
              sizes="32px"
            />
          </Link>

          {/* Right column — Nav Links (desktop) / Hamburger (mobile) */}
          <div className="flex items-center justify-end">
            {/* Desktop Nav Links */}
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-4 py-2 text-sm font-medium transition-colors rounded-lg
                    ${isActive(link.href)
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
              {/* Section badge for operational areas */}
              {inOperationalArea && (
                <span className="ml-2 px-2.5 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                  {section.shortLabel}
                </span>
              )}
            </div>

            {/* Mobile Menu Button — animated hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden relative w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              aria-label={isMobileMenuOpen ? '關閉選單' : '開啟選單'}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <m.span
                  className="block h-0.5 w-5 bg-current rounded-full origin-center"
                  animate={isMobileMenuOpen
                    ? { rotate: 45, y: 7 }
                    : { rotate: 0, y: 0 }
                  }
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
                <m.span
                  className="block h-0.5 w-5 bg-current rounded-full"
                  animate={isMobileMenuOpen
                    ? { opacity: 0, scaleX: 0 }
                    : { opacity: 1, scaleX: 1 }
                  }
                  transition={{ duration: 0.15 }}
                />
                <m.span
                  className="block h-0.5 w-5 bg-current rounded-full origin-center"
                  animate={isMobileMenuOpen
                    ? { rotate: -45, y: -7 }
                    : { rotate: 0, y: 0 }
                  }
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <m.div
              className="sm:hidden fixed inset-0 top-16 bg-neutral-900/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <m.div
              className="sm:hidden absolute left-0 right-0 top-full bg-bg-secondary border-b border-border shadow-elevation-3"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      block px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${isActive(link.href)
                        ? 'text-primary bg-primary/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                ))}
                {/* Section badge in drawer */}
                {inOperationalArea && (
                  <div className="px-4 py-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {section.label}
                    </span>
                  </div>
                )}
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

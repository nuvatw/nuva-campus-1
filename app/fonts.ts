import { Sora, DM_Sans, Noto_Sans_TC, Noto_Sans_JP, JetBrains_Mono } from 'next/font/google';

/**
 * Sora - Display / Headlines
 * Geometric, modern, distinctive — used for page titles, hero text, large numbers
 */
export const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sora',
  preload: true,
});

/**
 * DM Sans - Latin Body Text
 * Warm, geometric, more personality than Inter — used for body text, UI labels
 */
export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-dm-sans',
  preload: true,
});

/**
 * Noto Sans TC - Traditional Chinese
 * Primary font for all Chinese content
 */
export const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-tc',
  preload: true,
});

/**
 * Noto Sans JP - Japanese fallback
 */
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
  preload: false,
});

/**
 * JetBrains Mono - Monospace for data, codes, timestamps
 * Adds operational credibility to data-heavy screens
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono',
  preload: false,
});

/**
 * Combined font variable classNames for <html>
 */
export const fontVariables = `${sora.variable} ${dmSans.variable} ${notoSansTC.variable} ${notoSansJP.variable} ${jetbrainsMono.variable}`;

/**
 * Primary font className for <body>
 */
export const primaryFont = notoSansTC.className;

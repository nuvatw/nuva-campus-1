import { Inter, Noto_Sans_TC, Noto_Sans_JP } from 'next/font/google';

/**
 * Inter - 英文字體
 * 用於數字和英文內容
 */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

/**
 * Noto Sans TC - 繁體中文主要字體
 * 用於所有中文內容
 */
export const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-tc',
  preload: true,
});

/**
 * Noto Sans JP - 日文字體
 * 用於日文內容，作為次要字體
 */
export const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
  preload: false, // 次要字體不預載
});

/**
 * 組合所有字體變數的 className
 */
export const fontVariables = `${inter.variable} ${notoSansTC.variable} ${notoSansJP.variable}`;

/**
 * 主要字體 className（用於 body）
 */
export const primaryFont = notoSansTC.className;

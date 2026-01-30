import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/app/components/Providers";
import { fontVariables, primaryFont } from "./fonts";

export const metadata: Metadata = {
  title: "NUVA Campus",
  description: "NUVA 校園計劃互動區",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4A5568",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 從環境變數取得 Supabase URL（用於 preconnect）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : null;

  return (
    <html lang="zh-TW" className={fontVariables}>
      <head>
        {/* 預連接 Supabase API */}
        {supabaseHost && (
          <>
            <link rel="preconnect" href={`https://${supabaseHost}`} />
            <link rel="dns-prefetch" href={`https://${supabaseHost}`} />
          </>
        )}

        {/* 預連接 Google Fonts（由 next/font 管理，但 preconnect 可以加速） */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${primaryFont} antialiased bg-bg-primary text-text-primary`}>
        {/* Skip Link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          跳至主要內容
        </a>

        <Providers>
          <main id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

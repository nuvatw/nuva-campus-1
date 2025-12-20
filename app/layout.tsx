import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "第一屆 nuva 校園大使",
  description: "開啟你的校園影響力之旅",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">{children}</body>
    </html>
  );
}
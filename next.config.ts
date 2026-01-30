import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // 效能優化
  experimental: {
    // 優化特定套件的 imports
    optimizePackageImports: ['@supabase/supabase-js', 'swr'],
  },

  // 圖片優化
  images: {
    // 圖片格式優先順序：AVIF > WebP > 原始格式
    formats: ['image/avif', 'image/webp'],

    // 響應式斷點：對應常見螢幕寬度
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],

    // 小尺寸圖片：用於頭像、縮圖等
    imageSizes: [16, 32, 48, 64, 96, 128, 256],

    // 快取時間：7 天（平衡新鮮度與效能）
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days

    // 允許的外部圖片來源
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // 快取標頭
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // 壓縮
  compress: true,

  // 減少 bundle 大小
  productionBrowserSourceMaps: false,
};

export default withBundleAnalyzer(nextConfig);

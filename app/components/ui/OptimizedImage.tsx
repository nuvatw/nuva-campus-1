'use client';

import Image, { ImageProps } from 'next/image';
import { getBlurDataURL, imageSizes, imageQuality, type ImageSizeKey, type ImageQualityKey } from '@/app/utils/image';

type BaseImageProps = Omit<ImageProps, 'placeholder' | 'blurDataURL'>;

interface OptimizedImageProps extends BaseImageProps {
  /** 自訂 blur placeholder，若未提供則自動查找 */
  fallbackBlur?: string;
  /** 預設 sizes 配置鍵名 */
  sizePreset?: ImageSizeKey;
  /** 預設品質配置鍵名 */
  qualityPreset?: ImageQualityKey;
  /** 是否禁用 blur placeholder */
  disableBlur?: boolean;
}

/**
 * OptimizedImage - 優化的圖片組件
 *
 * 功能：
 * - 自動添加 blur placeholder
 * - 預設的 sizes 和 quality 配置
 * - 支援 Next.js Image 所有功能
 *
 * @example
 * ```tsx
 * // 基本使用
 * <OptimizedImage src="/hero.jpg" alt="Hero" fill priority />
 *
 * // 使用預設配置
 * <OptimizedImage
 *   src="/card.jpg"
 *   alt="Card"
 *   sizePreset="card"
 *   qualityPreset="card"
 *   width={400}
 *   height={300}
 * />
 * ```
 */
export function OptimizedImage({
  src,
  fallbackBlur,
  sizePreset,
  qualityPreset,
  disableBlur = false,
  sizes,
  quality,
  ...props
}: OptimizedImageProps) {
  // 取得 blur data URL
  const srcString = typeof src === 'string' ? src : '';
  const blurDataURL = fallbackBlur || getBlurDataURL(srcString);

  // 處理 sizes
  const finalSizes = sizes || (sizePreset ? imageSizes[sizePreset] : undefined);

  // 處理 quality
  const finalQuality = quality || (qualityPreset ? imageQuality[qualityPreset] : undefined);

  // 只有在不是 fill 模式且有具體尺寸時，或是有 blur data 時才使用 placeholder
  const shouldUseBlur = !disableBlur && blurDataURL;

  return (
    <Image
      src={src}
      sizes={finalSizes}
      quality={finalQuality}
      {...(shouldUseBlur ? {
        placeholder: 'blur' as const,
        blurDataURL,
      } : {})}
      {...props}
    />
  );
}

export default OptimizedImage;

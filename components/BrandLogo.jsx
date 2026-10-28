'use client';

import Image from 'next/image';

export const FALLBACK_LOGO = '/aquafinsbangladesh logo.png';

/**
 * Renders the brand logo. Local assets go through next/image; logos uploaded to
 * Cloudinary (or any external URL) are rendered with a plain <img> because
 * next.config.js does not declare remote image patterns.
 */
export default function BrandLogo({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}) {
  const isLocal = !src || src === FALLBACK_LOGO;

  if (isLocal) {
    return (
      <Image
        src={FALLBACK_LOGO}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

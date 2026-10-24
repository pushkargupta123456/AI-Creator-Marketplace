'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Remote image with a graceful gradient fallback (Cloudinary/Unsplash URLs).
 * `priority` opts an above-the-fold image out of lazy loading and asks the
 * browser to fetch it early.
 */
export function SmartImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (failed || !src) {
    return <div aria-label={alt || undefined} role={alt ? 'img' : 'presentation'} className={cn('bg-surface-3', className)} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      ref={(el) => {
        // Cached images can finish before React attaches onLoad.
        if (el?.complete && el.naturalWidth > 0) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cn('bg-surface-2 object-cover transition-opacity duration-500', loaded ? 'opacity-100' : 'opacity-0', className)}
    />
  );
}

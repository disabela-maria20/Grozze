'use client';

import { ratingColor } from '@/shared/lib/catalog';

export function RatingBadge({ rating }: { rating: string | undefined }) {
  const ratingStyle = ratingColor(rating);
  if (!ratingStyle) return null;
  return (
    <span
      className="min-w-7 h-7 px-1.5 rounded-[5px] text-white font-black leading-7 text-center inline-block"
      style={{ background: ratingStyle.color }}
      aria-label={`Classificação ${rating}`}
    >
      {ratingStyle.code}
    </span>
  );
}

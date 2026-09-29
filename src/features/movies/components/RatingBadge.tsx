'use client';

import { ratingColor } from '@/shared/lib/catalog/ratingColor';

export function RatingBadge({ rating }: { rating: string | undefined }) {
  const r = ratingColor(rating);
  if (!r) return null;
  return (
    <span
      className="min-w-7 h-7 px-1.5 rounded-[5px] text-white font-black leading-7 text-center inline-block"
      style={{ background: r.color }}
      aria-label={`Classificação ${rating}`}
    >
      {r.code}
    </span>
  );
}

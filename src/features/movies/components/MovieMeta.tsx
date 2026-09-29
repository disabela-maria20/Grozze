'use client';

import type { Movie } from '@/shared/lib/types';
import { ImdbBadge } from './ImdbBadge';
import { RatingBadge } from './RatingBadge';

export function MovieMeta({ m }: { m: Movie }) {
  const extras = [m.dur, m.genre].filter(Boolean);
  return (
    <div className="flex items-center gap-2.5 flex-wrap text-[#cbd4cc] text-sm mb-3.5 max-sm:justify-center max-sm:gap-1.5 max-sm:text-xs">
      <ImdbBadge m={m} />
      <RatingBadge rating={m.rating} />
      {extras.map((v, i) => (
        <span key={v} className="flex items-center gap-2.5 max-sm:gap-1.5">
          {i > 0 && <span className="text-[#79877b]">·</span>}
          {v}
        </span>
      ))}
    </div>
  );
}

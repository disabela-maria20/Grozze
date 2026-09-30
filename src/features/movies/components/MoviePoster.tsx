'use client';

import type { Movie } from '@/shared/lib/types';
import { statusLabel } from '@/shared/lib/catalog';

export function MoviePoster({
  m,
  className = '',
}: {
  m: Movie | null | undefined;
  className?: string;
}) {
  const tone = m?.colors?.[0] || '#355740';
  return (
    <div
      className={`art relative min-w-0 isolate aspect-2/3 rounded-2xl overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(circle at 70% 20%, ${tone}, transparent 53%), linear-gradient(140deg, #20382d, #0d1612)`,
      }}
    >
      <div className="absolute inset-[15px] flex flex-col justify-end text-[23px] leading-[1.04] font-extrabold tracking-tight break-words opacity-80">
        <small className="text-[8px] tracking-[0.16em] uppercase mb-2 font-semibold">
          {statusLabel(m)}
        </small>
        <span>{m?.t || 'Filme'}</span>
      </div>
      {m?.poster ? (
        <img
          src={m.poster}
          alt={`Pôster de ${m.t}`}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="w-full h-full object-cover absolute inset-0 z-[1]"
        />
      ) : null}
    </div>
  );
}

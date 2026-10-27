'use client';

import { type Movie, statusLabel } from '@/entities/movie';
import { RemoteImage } from '@/shared/ui';

export function MoviePoster({
  m,
  className = '',
}: {
  m: Movie | null | undefined;
  className?: string;
}) {
  const tone = m?.colors?.[0] || '#355740';
  const label = statusLabel(m);
  return (
    <div
      className={`art relative min-w-0 isolate aspect-2/3 rounded-2xl overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(circle at 70% 20%, ${tone}, transparent 53%), linear-gradient(140deg, #20382d, #0d1612)`,
      }}
    >
      <div className="absolute inset-[15px] flex flex-col justify-end text-[23px] leading-[1.04] font-extrabold tracking-tight break-words opacity-80">
        {label && (
          <small className="text-[8px] tracking-[0.16em] uppercase mb-2 font-semibold">
            {label}
          </small>
        )}
        <span className="text-sm leading-4">{m?.t || 'Filme'}</span>
      </div>
      {m?.poster ? (
        <RemoteImage
          src={m.poster}
          alt={`Pôster de ${m.t}`}
          fill
          sizes="(max-width: 640px) 45vw, 220px"
          draggable={false}
          className="object-cover z-[1]"
        />
      ) : null}
    </div>
  );
}

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
      className={`art @container relative min-w-0 isolate aspect-2/3 rounded-2xl overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(circle at 70% 20%, ${tone}, transparent 53%), linear-gradient(140deg, #20382d, #0d1612)`,
      }}
    >
      {/* No picture: the title, sized to the poster's width (container
          units), so a 62px thumbnail and a 200px card both read well. Words
          break with a hyphen (the page is pt-BR), never mid-letter. */}
      <div className="absolute inset-[9cqw] flex flex-col justify-end font-extrabold tracking-tight opacity-80">
        {label && (
          <small className="text-[8px] tracking-[0.16em] uppercase mb-2 font-semibold @max-[110px]:hidden">
            {label}
          </small>
        )}
        <span className="text-[clamp(8px,12cqw,16px)] leading-[1.1] hyphens-auto break-words line-clamp-4">
          {m?.t || 'Filme'}
        </span>
      </div>
      {m?.poster ? (
        <RemoteImage
          src={m.poster}
          alt={`Pôster de ${m.t}`}
          fill
          sizes="(max-width: 640px) 45vw, 220px"
          draggable={false}
          // Inside a movie card, a slow, slight zoom on hover
          className="object-cover z-[1] transition-transform duration-700 group-hover/card:scale-[1.04] motion-reduce:transition-none"
        />
      ) : null}
    </div>
  );
}

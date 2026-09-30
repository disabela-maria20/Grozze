'use client';

import { useAppStore } from '@/shared/store';
import { cinema, movie } from '@/shared/lib/catalog';
import { Icon } from './Icon';

export function HeartButton({
  kind,
  id,
  path,
  className = '',
}: {
  kind: 'movie' | 'cinema';
  id: string;
  path: string;
  className?: string;
}) {
  const on = useAppStore((s) =>
    kind === 'movie' ? s.movieSaved(id) : s.cinemaSaved(id)
  );
  const requestFavorite = useAppStore((s) => s.requestFavorite);
  const label = kind === 'movie' ? movie(id)?.t : cinema(id)?.name;

  return (
    <button
      type="button"
      className={`heart-btn w-[42px] h-[42px] rounded-full p-0 border border-line bg-[#0c130f] inline-grid place-items-center shrink-0 text-[#dce4dd] hover:border-lime/60 transition-colors ${
        on ? 'bg-lime! border-lime! text-[#081004]!' : ''
      } ${className}`}
      aria-pressed={on}
      aria-label={`${on ? 'Remover dos favoritos' : 'Favoritar'} ${label || ''}`}
      onClick={(e) => {
        e.preventDefault();
        requestFavorite(kind, id, path);
      }}
    >
      <Icon name="heart" className={on ? 'fill-current' : ''} />
    </button>
  );
}

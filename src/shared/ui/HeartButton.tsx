'use client';

import { useAppStore } from '@/shared/store';
import { Icon } from './Icon';

export function HeartButton({
  kind,
  id,
  label,
  path,
  className = '',
}: {
  kind: 'movie' | 'cinema';
  id: string;
  /** Movie title or cinema name, for the accessible label. */
  label?: string;
  path: string;
  className?: string;
}) {
  const isSaved = useAppStore((s) =>
    kind === 'movie' ? s.movieSaved(id) : s.cinemaSaved(id)
  );
  const requestFavorite = useAppStore((s) => s.requestFavorite);

  return (
    <button
      type="button"
      className={`heart-btn w-[42px] h-[42px] rounded-full p-0 border border-line bg-[#0c130f] inline-grid place-items-center shrink-0 text-[#dce4dd] hover:border-lime/60 transition-colors ${
        isSaved ? 'bg-lime! border-lime! text-[#081004]!' : ''
      } ${className}`}
      aria-pressed={isSaved}
      aria-label={`${isSaved ? 'Remover dos favoritos' : 'Favoritar'} ${label ?? ''}`}
      onClick={(event) => {
        event.preventDefault();
        requestFavorite(kind, id, path);
      }}
    >
      <Icon name="heart" className={isSaved ? 'fill-current' : ''} />
    </button>
  );
}

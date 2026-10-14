'use client';

import { cinema, inLocation } from '@/entities/cinema';
import { useAppStore } from '@/shared/store';
import { isRerelease, statusLabel } from './model';
import type { Movie } from './types';
import { useMovieShowtimesQuery } from './useMovieShowtimesQuery';

/**
 * `statusLabel`, but a re-release is only tagged when it has sessions in the
 * user's location: its sessions are usually a handful of cinemas, so the
 * nationwide flag would tag movies nobody nearby can watch. Its showtimes
 * are fetched (and shared with the movie page) only for re-releases.
 */
export function useStatusLabel(m: Movie | null | undefined): string {
  const location = useAppStore((s) => s.location);
  const rerelease = isRerelease(m);
  const showtimes = useMovieShowtimesQuery(
    m?.id ?? '',
    rerelease ? undefined : null
  );
  if (!rerelease) return statusLabel(m);
  const nearby = (showtimes.data ?? []).some((row) => {
    const theater = cinema(row.theater);
    return !!theater && inLocation(theater, location);
  });
  return nearby ? 'Relançamento' : '';
}

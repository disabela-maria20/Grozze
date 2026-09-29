import showtimesJson from '@/data/showtimes.json';
import type { Showtime } from '../types';

export const SESSIONS: Showtime[] = (showtimesJson as Showtime[]).map((s) =>
  Object.freeze({
    ...s,
    id: String(s.id),
    movie: String(s.movie),
    theater: String(s.theater),
  })
);

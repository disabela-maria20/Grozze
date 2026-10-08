import type { Movie } from '../types';
import { hasSessions } from './hasSessions';
import { nowInSaoPaulo } from './nowInSaoPaulo';
import { validDate } from './validDate';

/**
 * Tag shown on a movie: pre-sale when it has sessions before the release,
 * in theaters when it has sessions, coming soon when it hasn't been released
 * yet, and no tag for released movies without sessions.
 */
export function statusLabel(movie: Movie | null | undefined): string {
  if (!movie) return '';
  const sessions = hasSessions(movie.id);
  const dated = validDate(movie.releaseDate);
  const today = nowInSaoPaulo().date;
  if (sessions && dated && movie.releaseDate > today) return 'Em pré-venda';
  if (sessions) return 'Hoje nos cinemas';
  if (dated && movie.releaseDate <= today) return '';
  return 'Em breve nos cinemas';
}

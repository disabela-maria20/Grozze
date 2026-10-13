import type { Movie, MovieStatus } from '../types';
import { hasSessions } from './hasSessions';
import { nowInSaoPaulo } from './nowInSaoPaulo';
import { validDate } from './validDate';

export function status(m: Movie | null | undefined): MovieStatus {
  if (!m) return 'soon';
  if (!validDate(m.releaseDate)) return 'now';
  const today = nowInSaoPaulo().date;
  const sessions = hasSessions(m.id);
  // Without sessions, a movie stays upcoming through its release day
  if (!sessions && m.releaseDate >= today) return 'soon';
  if (m.releaseDate > today) return 'presale';
  return 'now';
}

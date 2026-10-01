import type { Movie, MovieStatus } from '../types';
import { hasSessions } from './hasSessions';
import { nowInSaoPaulo } from './nowInSaoPaulo';
import { validDate } from './validDate';

export function status(m: Movie | null | undefined): MovieStatus {
  if (!m) return 'soon';
  const today = nowInSaoPaulo().date;
  const upcoming =
    (validDate(m.releaseDate) && m.releaseDate > today) ||
    (validDate(m.firstShowtime) && m.firstShowtime! > today);
  if (!upcoming) return 'now';
  return hasSessions(m.id) ? 'presale' : 'soon';
}

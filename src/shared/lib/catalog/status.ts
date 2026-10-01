import type { Movie, MovieStatus } from '../types';
import { hasSessions } from './hasSessions';
import { nowInSaoPaulo } from './nowInSaoPaulo';
import { validDate } from './validDate';

export function status(m: Movie | null | undefined): MovieStatus {
  if (!m) return 'soon';
  if (validDate(m.releaseDate) && m.releaseDate > nowInSaoPaulo().date) {
    return hasSessions(m.id) ? 'presale' : 'soon';
  }
  return 'now';
}

import type { Showtime } from '../types';
import { type SessionFilterState } from './SessionFilterState';

/**
 * Sessions of the selected date matching the active filters. `exclude` skips
 * one filter group (used to count that group's options).
 */
export function filterRows(
  rows: Showtime[],
  filters: SessionFilterState,
  exclude = ''
): Showtime[] {
  return rows.filter(
    (showtime) =>
      showtime.date === filters.date &&
      (exclude === 'tech' ||
        filters.tech === 'Todos' ||
        showtime.tech === filters.tech) &&
      (exclude === 'lang' ||
        filters.lang === 'Todos' ||
        showtime.lang === filters.lang) &&
      (exclude === 'cinema' ||
        filters.cinema === 'Todos' ||
        showtime.theater === filters.cinema)
  );
}

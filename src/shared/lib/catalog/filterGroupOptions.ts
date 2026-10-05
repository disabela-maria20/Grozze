import type { Showtime } from '../types';
import { cinema } from './cinema';
import { type FilterOption } from './FilterOption';
import { filterRows } from './filterRows';
import { type SessionFilterState } from './SessionFilterState';
import { unique } from './unique';

/**
 * Options of one filter group ("Todos" first) for the selected date. Counts
 * apply the other active filters but not this group's own, so every option
 * shows how many sessions picking it would leave. `null` when the date has no
 * values for the group.
 */
export function filterGroupOptions(
  rows: Showtime[],
  filters: SessionFilterState,
  key: 'tech' | 'lang' | 'cinema'
): FilterOption[] | null {
  const dayRows = rows.filter((showtime) => showtime.date === filters.date);
  const field = key === 'cinema' ? 'theater' : key;
  const values = unique(dayRows.map((showtime) => showtime[field]));
  if (!values.length) return null;
  const available = filterRows(rows, filters, key);
  return ['Todos', ...values].map((value) => {
    const count =
      value === 'Todos'
        ? available.length
        : available.filter((showtime) => showtime[field] === value).length;
    const label =
      key === 'cinema' && value !== 'Todos'
        ? cinema(value)?.name || value
        : value;
    return {
      value,
      label,
      count,
      active: filters[key] === value,
      disabled: count === 0,
    };
  });
}

import type { Showtime } from '../types';
import { cinema } from './cinema';
import { type FilterOption } from './FilterOption';
import { filterRows } from './filterRows';
import { type SessionFilterState } from './SessionFilterState';
import { unique } from './unique';

export function filterGroupOptions(
  rows: Showtime[],
  f: SessionFilterState,
  key: 'tech' | 'lang' | 'cinema'
): FilterOption[] | null {
  const day = rows.filter((s) => s.date === f.date);
  const field = key === 'cinema' ? 'theater' : key;
  const vals = unique(day.map((s) => s[field]));
  if (!vals.length) return null;
  const available = filterRows(rows, f, key);
  return ['Todos', ...vals].map((v) => {
    const count =
      v === 'Todos'
        ? available.length
        : available.filter((s) => s[field] === v).length;
    return {
      value: v,
      label: key === 'cinema' && v !== 'Todos' ? cinema(v)?.name || v : v,
      count,
      active: f[key] === v,
      disabled: count === 0,
    };
  });
}

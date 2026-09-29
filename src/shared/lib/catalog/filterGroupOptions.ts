import { cinema } from './cinema';
import { type FilterOption } from './FilterOption';
import { filterRows } from './filterRows';
import { type SessionFilterState } from './SessionFilterState';
import { SESSIONS } from './SESSIONS';
import { unique } from './unique';

export function filterGroupOptions(
  id: string,
  f: SessionFilterState,
  key: 'tech' | 'lang' | 'cinema'
): FilterOption[] | null {
  const day = SESSIONS.filter((s) => s.movie === id && s.date === f.date);
  const field = key === 'cinema' ? 'theater' : key;
  const vals = unique(day.map((s) => s[field]));
  if (!vals.length) return null;
  const available = filterRows(id, f, key);
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

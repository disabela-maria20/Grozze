import type { Showtime } from '../types';

export function groupedRooms(
  rows: Showtime[],
  preferences?: { language?: string; format?: string }
): Showtime[][] {
  const map = new Map<string, Showtime[]>();
  for (const s of rows) {
    const key = [s.room, s.tech, s.lang].join('|');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  const pref = preferences || {};
  const priority = (s: Showtime) =>
    (pref.language && pref.language !== 'Todos' && s.lang === pref.language
      ? 2
      : 0) +
    (pref.format && pref.format !== 'Todos' && s.tech === pref.format ? 1 : 0);
  return [...map.values()]
    .sort(
      (a, b) =>
        priority(b[0]) - priority(a[0]) ||
        a[0].room.localeCompare(b[0].room, 'pt-BR', { numeric: true }) ||
        a[0].lang.localeCompare(b[0].lang)
    )
    .map((r) => r.slice().sort((a, b) => a.time.localeCompare(b.time)));
}

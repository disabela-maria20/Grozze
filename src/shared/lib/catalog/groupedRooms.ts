import type { Showtime } from '../types';

type RoomPreferences = { language?: string; format?: string };

/**
 * Sort weight of a session for the user's preferences: matching language
 * counts 2, matching format 1 ("Todos" or unset never matches).
 */
function preferenceScore(
  showtime: Showtime,
  preferences: RoomPreferences
): number {
  let score = 0;
  if (
    preferences.language &&
    preferences.language !== 'Todos' &&
    showtime.lang === preferences.language
  )
    score += 2;
  if (
    preferences.format &&
    preferences.format !== 'Todos' &&
    showtime.tech.includes(preferences.format)
  )
    score += 1;
  return score;
}

/**
 * Groups sessions by room + format + language, each group sorted by time.
 * Groups matching the preferences come first, then by room name and language.
 */
export function groupedRooms(
  rows: Showtime[],
  preferences?: RoomPreferences
): Showtime[][] {
  const groups = new Map<string, Showtime[]>();
  for (const showtime of rows) {
    const key = [showtime.room, showtime.tech, showtime.lang].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(showtime);
  }
  const prefs = preferences || {};
  return [...groups.values()]
    .sort(
      (a, b) =>
        preferenceScore(b[0], prefs) - preferenceScore(a[0], prefs) ||
        a[0].room.localeCompare(b[0].room, 'pt-BR', { numeric: true }) ||
        a[0].lang.localeCompare(b[0].lang)
    )
    .map((group) => group.slice().sort((a, b) => a.time.localeCompare(b.time)));
}

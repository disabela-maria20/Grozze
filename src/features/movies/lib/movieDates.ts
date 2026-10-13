import type { Showtime } from '@/entities/movie';
import { unique } from '@/shared/lib/text';

export function movieDates(rows: Showtime[]): string[] {
  return unique(rows.map((s) => s.date)).sort();
}

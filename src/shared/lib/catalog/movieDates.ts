import type { Showtime } from '../types';
import { unique } from './unique';

export function movieDates(rows: Showtime[]): string[] {
  return unique(rows.map((s) => s.date)).sort();
}

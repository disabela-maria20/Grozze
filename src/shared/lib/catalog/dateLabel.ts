import { dateParts } from './dateParts';
import { MONTH_NAMES } from './MONTH_NAMES';
import { validDate } from './validDate';

/** "2026-09-08" → "8 set", or "8 de setembro de 2026" when `full`. */
export function dateLabel(date: string | undefined, full = false): string {
  if (!validDate(date)) return 'Data a confirmar';
  const parts = dateParts(date!);
  if (!full) return `${parts.day} ${parts.month}`;
  const monthName =
    MONTH_NAMES[new Date(date + 'T12:00:00').getMonth()].toLowerCase();
  return `${parts.day} de ${monthName} de ${date!.slice(0, 4)}`;
}

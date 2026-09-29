import { dateParts } from './dateParts';
import { MONTH_NAMES } from './MONTH_NAMES';
import { validDate } from './validDate';

export function dateLabel(d: string | undefined, full = false): string {
  if (!validDate(d)) return 'Data a confirmar';
  const p = dateParts(d!);
  return full
    ? `${p.day} de ${MONTH_NAMES[new Date(d + 'T12:00:00').getMonth()].toLowerCase()} de ${d!.slice(0, 4)}`
    : `${p.day} ${p.month}`;
}

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/** Whether the value is a real "YYYY-MM-DD" date. */
export function validDate(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(value + 'T12:00:00').getTime())
  );
}

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** Day, short month and weekday of a "YYYY-MM-DD" date (read at noon to dodge DST/timezone shifts). */
export function dateParts(isoDate: string) {
  const date = new Date(isoDate + 'T12:00:00');
  return {
    day: date.getDate(),
    month: MONTH_NAMES[date.getMonth()].slice(0, 3).toLowerCase(),
    weekday: WEEKDAYS[date.getDay()],
  };
}

/** "2026-09-08" → "8 set", or "8 de setembro de 2026" when `full`. */
export function dateLabel(date: string | undefined, full = false): string {
  if (!validDate(date)) return 'Data a confirmar';
  const parts = dateParts(date!);
  if (!full) return `${parts.day} ${parts.month}`;
  const monthName =
    MONTH_NAMES[new Date(date + 'T12:00:00').getMonth()].toLowerCase();
  return `${parts.day} de ${monthName} de ${date!.slice(0, 4)}`;
}

/** Current date and time in São Paulo, the catalog's reference timezone. */
export function nowInSaoPaulo(): {
  date: string;
  hour: string;
  minute: string;
} {
  // en-CA yields zero-padded, ISO-like parts ("2026-09-08")
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const byType = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
  return {
    date: `${byType.year}-${byType.month}-${byType.day}`,
    hour: byType.hour,
    minute: byType.minute,
  };
}

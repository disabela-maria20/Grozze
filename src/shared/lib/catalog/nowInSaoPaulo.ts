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

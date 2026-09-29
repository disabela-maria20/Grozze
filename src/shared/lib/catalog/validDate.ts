export function validDate(v: unknown): boolean {
  return (
    typeof v === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    !Number.isNaN(new Date(v + 'T12:00:00').getTime())
  );
}

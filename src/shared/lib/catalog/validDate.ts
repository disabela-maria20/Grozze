/** Whether the value is a real "YYYY-MM-DD" date. */
export function validDate(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(value + 'T12:00:00').getTime())
  );
}

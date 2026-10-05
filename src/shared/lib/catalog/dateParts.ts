import { MONTH_NAMES } from './MONTH_NAMES';

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

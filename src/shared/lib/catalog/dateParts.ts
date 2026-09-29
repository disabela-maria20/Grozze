import { MONTH_NAMES } from './MONTH_NAMES';

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function dateParts(d: string) {
  const dt = new Date(d + 'T12:00:00');
  return {
    day: dt.getDate(),
    month: MONTH_NAMES[dt.getMonth()].slice(0, 3).toLowerCase(),
    weekday: WEEKDAYS[dt.getDay()],
  };
}

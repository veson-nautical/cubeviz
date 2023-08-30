import { RelativeDate } from '../types/relative-date';
import { DateTime } from 'luxon';

export function stringToRelativeDate(str: string): RelativeDate | undefined {
  if (str === 'today') return { type: 'today' };
  const date = DateTime.fromISO(str);
  if (date.isValid) {
    return { type: 'exact', date: date.toJSDate() };
  } else {
    const match = str.match(/(\d+) (day|week|month|year)s? (ago|from now)/);
    if (match) {
      return {
        type: 'relative',
        direction: (match[3] === 'ago' ? 'last' : 'next') as 'last' | 'next',
        number: parseInt(match[1], 10),
        unit: match[2] as 'day' | 'week' | 'month' | 'year',
      };
    }
  }
  return undefined;
}

export function relativeDateToString(
  date?: RelativeDate,
  dateDisplayFormat?: string
) {
  if (!date || date.type == 'today') return 'today';
  if (date.type === 'exact') {
    const dt = DateTime.fromJSDate(date.date);
    return dateDisplayFormat
      ? dt.toFormat(dateDisplayFormat)
      : dt.toISO({
          includeOffset: false,
        });
  } else {
    return `${date.number} ${date.unit}${date.number === 1 ? '' : 's'} ${
      date.direction === 'last' ? 'ago' : 'from now'
    }`;
  }
}

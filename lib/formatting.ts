const DEFAULT_LOCALE = 'ko';

const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = MS_IN_SECOND * 60;
const MS_IN_HOUR = MS_IN_MINUTE * 60;
const MS_IN_DAY = MS_IN_HOUR * 24;
const MS_IN_WEEK = MS_IN_DAY * 7;

export function formatRelativeTimeFromNow(dateISO: string, locale: string = DEFAULT_LOCALE): string {
  const target = new Date(dateISO);
  if (Number.isNaN(target.getTime())) {
    return '';
  }

  const now = new Date();
  const diff = target.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (absDiff >= MS_IN_WEEK) {
    const weeks = Math.round(diff / MS_IN_WEEK);
    return rtf.format(weeks, 'week');
  }
  if (absDiff >= MS_IN_DAY) {
    const days = Math.round(diff / MS_IN_DAY);
    return rtf.format(days, 'day');
  }
  if (absDiff >= MS_IN_HOUR) {
    const hours = Math.round(diff / MS_IN_HOUR);
    return rtf.format(hours, 'hour');
  }
  if (absDiff >= MS_IN_MINUTE) {
    const minutes = Math.round(diff / MS_IN_MINUTE);
    return rtf.format(minutes, 'minute');
  }

  const seconds = Math.round(diff / MS_IN_SECOND);
  return rtf.format(seconds, 'second');
}

export function formatAbsoluteDate(dateISO: string, locale: string = DEFAULT_LOCALE, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateISO);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const formatter = new Intl.DateTimeFormat(locale, options ?? {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(date);
}

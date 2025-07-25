import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function formatTimestamp(utcString: string) {
  const utcDate = new Date(utcString + 'Z');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localDate = toZonedTime(utcDate, timezone);

  return differenceInHours(new Date(), localDate) < 24
    ? formatDistanceToNow(localDate, { addSuffix: true })
    : format(localDate, 'dd/MM/yyyy');
}

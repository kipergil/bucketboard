import type { OpeningHours } from '@bucketboard/shared';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/** True if `now` falls within any of today's opening spans. Pure aside from the `now` default. */
export function isStoreOpenNow(hours: OpeningHours | null, now: Date = new Date()): boolean {
  if (!hours) return false;
  const dayKey = DAY_KEYS[now.getDay()];
  const spans = dayKey ? hours[dayKey] : undefined;
  if (!spans || spans.length === 0) return false;

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return spans.some((span) => {
    const [openH, openM] = span.opens.split(':').map(Number);
    const [closeH, closeM] = span.closes.split(':').map(Number);
    const openMinutes = (openH ?? 0) * 60 + (openM ?? 0);
    const closeMinutes = (closeH ?? 0) * 60 + (closeM ?? 0);
    return minutesNow >= openMinutes && minutesNow <= closeMinutes;
  });
}

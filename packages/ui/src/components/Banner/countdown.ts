// Countdown maths for Banner, kept pure so it can be tested without timers.

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Milliseconds left, never negative. */
  remainingMs: number;
  ended: boolean;
  /** Less than one hour left and not ended. */
  lastHour: boolean;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Splits the time left until `endsAt` into whole units; partial seconds are dropped. */
export function getCountdown(endsAt: Date | string, now: Date): Countdown {
  const remainingMs = Math.max(0, toDate(endsAt).getTime() - now.getTime());
  const whole = Math.floor(remainingMs / SECOND) * SECOND;
  return {
    days: Math.floor(whole / DAY),
    hours: Math.floor((whole % DAY) / HOUR),
    minutes: Math.floor((whole % HOUR) / MINUTE),
    seconds: Math.floor((whole % MINUTE) / SECOND),
    remainingMs,
    ended: whole === 0,
    lastHour: whole > 0 && whole < HOUR,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "02d 07h 52m 36s"; leading zero days, then zero hours, are dropped ("52m 36s"). */
export function formatCountdown(c: Countdown): string {
  const parts: string[] = [];
  if (c.days > 0) parts.push(`${pad(c.days)}d`);
  if (c.days > 0 || c.hours > 0) parts.push(`${pad(c.hours)}h`);
  parts.push(`${pad(c.minutes)}m`, `${pad(c.seconds)}s`);
  return parts.join(' ');
}

const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * Minute-level wording for screen readers: the two largest non-zero units.
 * "Offer ends in 2 days 7 hours", "Offer ends in 45 minutes".
 */
export function describeCountdown(c: Countdown): string {
  if (c.ended) return 'This offer has ended';
  let rest: string;
  if (c.days > 0) rest = [unit(c.days, 'day'), c.hours > 0 && unit(c.hours, 'hour')].filter(Boolean).join(' ');
  else if (c.hours > 0) rest = [unit(c.hours, 'hour'), c.minutes > 0 && unit(c.minutes, 'minute')].filter(Boolean).join(' ');
  else if (c.minutes > 0) rest = unit(c.minutes, 'minute');
  else rest = 'less than a minute';
  return `Offer ends in ${rest}`;
}

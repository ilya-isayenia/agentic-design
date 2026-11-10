// Fake backend. Delays make loading states visible; `?mock=` in the URL forces other states
// (docs/product/mock-data.md).
import { CITIES, CLUBS, type Club } from '@web/data/clubs';
import type { DurationId } from '@web/data/plans';
import { checkCode, type CheckResult } from './discount';

export type MockFlag = 'error' | 'slow' | 'submit-error' | 'sms-expired' | 'code-error';

export function mockFlags(search = typeof location === 'undefined' ? '' : location.search): Set<string> {
  return new Set((new URLSearchParams(search).get('mock') ?? '').split(',').filter(Boolean));
}

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

const squash = (s: string) => s.toLowerCase().replace(/\s+/g, '');

export function matchClubs(query: string): Club[] {
  const q = squash(query);
  if (!q) return CLUBS;
  return CLUBS.filter((club) => {
    const city = CITIES.find((c) => c.id === club.cityId)?.name ?? '';
    return [club.name, city, club.area].some((s) => squash(s).includes(q)) || squash(club.postcode).startsWith(q);
  });
}

export async function searchClubs(query: string, signal?: AbortSignal): Promise<Club[]> {
  const flags = mockFlags();
  await wait(flags.has('slow') ? 3000 : 500, signal);
  if (flags.has('error')) throw new Error('Clubs service unavailable (mock)');
  return matchClubs(query);
}

export async function submitDetails(): Promise<void> {
  await wait(800);
  if (mockFlags().has('submit-error')) throw new Error('Signup service unavailable (mock)');
}

/** Checks a discount code against the chosen duration. Throws with `?mock=code-error`; 3 s with `?mock=slow`. */
export async function checkDiscountCode(code: string, duration: DurationId, signal?: AbortSignal, now = new Date()): Promise<CheckResult> {
  const flags = mockFlags();
  await wait(flags.has('slow') ? 3000 : 600, signal);
  if (flags.has('code-error')) throw new Error('Discount service unavailable (mock)');
  return checkCode(code, duration, now);
}

export const SMS = { validMs: 120_000, resendAfterMs: 30_000, rightCode: '123456' };

export interface SmsSession {
  sentAt: number;
  expiresAt: number;
}

export async function sendSmsCode(now = Date.now()): Promise<SmsSession> {
  await wait(400);
  const expired = mockFlags().has('sms-expired');
  return { sentAt: now, expiresAt: expired ? now : now + SMS.validMs };
}

export type VerifyResult = 'ok' | 'wrong' | 'expired';

export async function verifySmsCode(code: string, session: SmsSession, now = Date.now()): Promise<VerifyResult> {
  await wait(500);
  if (now >= session.expiresAt) return 'expired';
  return code.trim() === SMS.rightCode ? 'ok' : 'wrong';
}

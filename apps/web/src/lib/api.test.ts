import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkDiscountCode, matchClubs, mockFlags } from './api';

describe('club search', () => {
  it('returns all clubs for an empty query', () => {
    expect(matchClubs('').length).toBeGreaterThan(5);
  });
  it('matches town names case-insensitively', () => {
    expect(matchClubs('BELMAR').every((c) => c.cityId === 'belmar')).toBe(true);
  });
  it('matches postcodes ignoring spaces', () => {
    expect(matchClubs('ar10').map((c) => c.id)).toEqual(['arden-north', 'arden-harbour']);
  });
  it('returns nothing for nonsense', () => {
    expect(matchClubs('zzz')).toEqual([]);
  });
  it('reads mock flags from the query string', () => {
    expect([...mockFlags('?mock=error,slow')]).toEqual(['error', 'slow']);
  });
});

describe('discount code check', () => {
  const NOW = new Date('2026-11-20T10:00:00Z');

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
  });

  it('answers after 600 ms', async () => {
    vi.useFakeTimers();
    const answer = checkDiscountCode('TEST-10', 'two-years', undefined, NOW);
    await vi.advanceTimersByTimeAsync(600);
    await expect(answer).resolves.toBe('applied');
  });

  it('fails with ?mock=code-error, the same way for every retry', async () => {
    vi.useFakeTimers();
    window.history.replaceState(null, '', '/?mock=code-error');
    for (let attempt = 0; attempt < 2; attempt++) {
      const answer = checkDiscountCode('TEST-10', 'two-years', undefined, NOW);
      const failed = expect(answer).rejects.toThrow('Discount service unavailable');
      await vi.advanceTimersByTimeAsync(600);
      await failed;
    }
  });

  it('can be cancelled while it runs', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const answer = checkDiscountCode('TEST-10', 'two-years', controller.signal, NOW);
    controller.abort();
    await expect(answer).rejects.toThrow('Aborted');
    expect(vi.getTimerCount()).toBe(0);
  });
});

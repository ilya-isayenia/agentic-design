import { describe, expect, it } from 'vitest';
import { formatMoney } from './format';

describe('formatMoney', () => {
  it('drops decimals for whole euros', () => expect(formatMoney(3600)).toBe('€36'));
  it('keeps two decimals otherwise', () => expect(formatMoney(4950)).toBe('€49.50'));
  it('formats zero', () => expect(formatMoney(0)).toBe('€0'));
});

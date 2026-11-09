import { describe, expect, it } from 'vitest';
import { formatIban, isValidBic, lookupBank, validateIban } from './iban';
import { TEST_IBANS } from '@web/data/banks';

describe('iban', () => {
  it('accepts the fake test IBANs', () => {
    for (const iban of Object.values(TEST_IBANS)) expect(validateIban(iban)).toBeNull();
  });

  it('ignores spaces and case', () => {
    expect(validateIban('nl13 test 0123 4567 89')).toBeNull();
  });

  it('names the problem', () => {
    expect(validateIban('')).toBe('required');
    expect(validateIban('NL13TEST01234567-9')).toBe('characters');
    expect(validateIban('XX13TEST0123456789')).toBe('country');
    expect(validateIban('NL13TEST012345678')).toBe('length');
    expect(validateIban('NL00TEST0123456789')).toBe('checksum');
  });

  it('formats in groups of four', () => {
    expect(formatIban('nl13test0123456789')).toBe('NL13 TEST 0123 4567 89');
  });

  it('fills the bank for known codes only', () => {
    expect(lookupBank(TEST_IBANS.nl)).toEqual({ bic: 'TESTNL2A', name: 'Test Bank (fake)' });
    expect(lookupBank('NL00TEST0123456789')).toBeNull();
    expect(lookupBank(TEST_IBANS.unknownBank)).toBeNull();
  });

  it('checks BIC shape', () => {
    expect(isValidBic('TESTNL2A')).toBe(true);
    expect(isValidBic('TESTNL2AXXX')).toBe(true);
    expect(isValidBic('TEST')).toBe(false);
  });
});

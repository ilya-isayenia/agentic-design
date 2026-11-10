import { describe, expect, it } from 'vitest';
import { planPrice } from './pricing';
import {
  appliedAnnouncement,
  checkCode,
  discountAmount,
  discountedPrice,
  durationsPhrase,
  keptSentence,
  nextApplied,
  noLongerAppliesMessage,
  normaliseCode,
  rejectionMessage,
  removedAnnouncement,
} from './discount';

const NOW = new Date('2026-11-20T10:00:00Z');

describe('discount codes', () => {
  it('normalises case and surrounding spaces', () => {
    expect(normaliseCode(' test-10 ')).toBe('TEST-10');
    expect(checkCode(' test-10 ', 'two-years', NOW)).toBe('applied');
  });

  it('knows unknown, expired and plan-limited codes', () => {
    expect(checkCode('NOPE', 'two-years', NOW)).toBe('unknown');
    expect(checkCode('TEST-EXPIRED', 'two-years', NOW)).toBe('expired');
    expect(checkCode('TEST-EXPIRED', 'two-years', new Date('2019-12-31T12:00:00Z'))).toBe('applied');
    expect(checkCode('TEST-FLEX20', 'two-years', NOW)).toBe('not-eligible');
    expect(checkCode('TEST-FLEX20', 'one-year', NOW)).toBe('not-eligible');
    expect(checkCode('TEST-FLEX20', 'flex', NOW)).toBe('applied');
  });

  it('takes the percentage off the promo price, rounded to 50 cents', () => {
    // Home club, 2 years: €22 → €20.
    const twoYears = planPrice('regular', 'home', 'two-years').amount;
    expect(discountedPrice(twoYears, 0.1)).toBe(2000);
    expect(discountAmount(twoYears, 0.1)).toBe(200);
    // Home club, flex: €59.50 → €47.50 with 20%, → €53.50 with 10%.
    const flex = planPrice('regular', 'home', 'flex').amount;
    expect(flex).toBe(5950);
    expect(discountedPrice(flex, 0.2)).toBe(4750);
    expect(discountedPrice(flex, 0.1)).toBe(5350);
  });

  describe('nextApplied: one code at a time', () => {
    it('applies a valid code when none is applied', () => {
      expect(nextApplied('', 'test-10', 'applied')).toBe('TEST-10');
    });
    it('replaces the applied code with a new valid one', () => {
      expect(nextApplied('TEST-10', 'TEST-FLEX20', 'applied')).toBe('TEST-FLEX20');
    });
    it('keeps the applied code when the new one is rejected or the check fails', () => {
      for (const result of ['unknown', 'expired', 'not-eligible', 'failed'] as const) {
        expect(nextApplied('TEST-10', 'TEST-FLEX20', result)).toBe('TEST-10');
      }
    });
    it('keeps nothing applied when nothing was', () => {
      expect(nextApplied('', 'NOPE', 'unknown')).toBe('');
    });
  });

  it('names the durations a code covers', () => {
    expect(durationsPhrase(['flex'])).toBe('Flex');
    expect(durationsPhrase(['one-year', 'two-years'])).toBe('2-year and 1-year');
  });

  it('writes a message that says what to do next', () => {
    expect(rejectionMessage('unknown', 'NOPE')).toBe("We don't recognise this code. Check the spelling and try again.");
    expect(rejectionMessage('expired', 'TEST-EXPIRED')).toBe('This code has expired. Try another code.');
    expect(rejectionMessage('not-eligible', 'test-flex20')).toBe('TEST-FLEX20 works on Flex plans only. Choose Flex or try another code.');
    expect(rejectionMessage('failed', 'TEST-10')).toBe("We couldn't check the code. Check your connection and try again.");
    expect(noLongerAppliesMessage('TEST-FLEX20', 'not-eligible')).toBe(
      "TEST-FLEX20 works on Flex plans only, so it's no longer in your total. Choose Flex and apply it again.",
    );
    expect(keptSentence('TEST-10')).toBe('TEST-10 is still in your total.');
  });

  it('announces applied, replaced and removed with the new total', () => {
    expect(appliedAnnouncement('TEST-10', '', '€20')).toBe('TEST-10 applied. Your first payment is now €20.');
    expect(appliedAnnouncement('TEST-10', 'TEST-10', '€20')).toBe('TEST-10 applied. Your first payment is now €20.');
    expect(appliedAnnouncement('TEST-FLEX20', 'TEST-10', '€72.50')).toBe(
      'TEST-FLEX20 applied instead of TEST-10. Your first payment is now €72.50.',
    );
    expect(removedAnnouncement('€22')).toBe('Code removed. Your first payment is now €22.');
  });
});

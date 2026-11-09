import { describe, expect, it } from 'vitest';
import { firstPayment, fromPrice, planPrice, pricePerWorkout, roundToHalfEuro, starterPrice } from './pricing';

describe('pricing', () => {
  it('rounds to 50 cents', () => {
    expect(roundToHalfEuro(4840)).toBe(4850);
    expect(roundToHalfEuro(4824)).toBe(4800);
  });

  it('halves the two-year price for a regular home club member', () => {
    expect(planPrice('regular', 'home', 'two-years')).toEqual({ amount: 2200, regular: 4400 });
  });

  it('applies the one-year factor before the promo', () => {
    expect(planPrice('regular', 'home', 'one-year')).toEqual({ amount: 2450, regular: 4850 });
  });

  it('has no promo on flex', () => {
    expect(planPrice('regular', 'city', 'flex')).toEqual({ amount: 9200, regular: 9200 });
  });

  it('applies the membership type factor', () => {
    expect(planPrice('student', 'home', 'two-years')).toEqual({ amount: 1750, regular: 3500 });
  });

  it('takes the lowest price as "from"', () => {
    expect(fromPrice('regular', 'area').amount).toBe(planPrice('regular', 'area', 'two-years').amount);
  });

  it('waives the starter package on long plans only', () => {
    expect(starterPrice('two-years')).toBe(0);
    expect(starterPrice('flex')).toBe(2500);
    expect(firstPayment('regular', 'home', 'flex')).toEqual({ amount: 8450, regular: 8450 });
    expect(firstPayment('regular', 'home', 'two-years')).toEqual({ amount: 2200, regular: 6900 });
  });

  it('prices one workout', () => {
    expect(pricePerWorkout(2400, 0)).toBeNull();
    expect(pricePerWorkout(2400, 3)).toBe(200);
  });
});

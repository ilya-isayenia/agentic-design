import { describe, expect, it } from 'vitest';
import { FIELD_ORDER, ageOn, emptyDetails, validateDetails, type Details } from './details';
import { TEST_IBANS } from '@web/data/banks';

const today = new Date(2026, 10, 9);
const valid: Details = {
  firstName: 'Test', lastName: 'Person', birthDate: '1990-05-01', email: 'test.person@example.com',
  phoneCountry: '+31', phone: '600000000', street: 'Sample Street', houseNumber: '1', postcode: '0000 AA',
  city: 'Arden', country: 'demoland', iban: TEST_IBANS.nl, bic: 'TESTNL2A', bankName: 'Test Bank (fake)', consent: true,
};

describe('details', () => {
  it('passes a complete form', () => {
    expect(validateDetails(valid, today)).toEqual({});
  });

  it('reports every empty field in form order', () => {
    const errors = validateDetails(emptyDetails(), today);
    expect(Object.keys(errors)).toEqual(FIELD_ORDER.filter((f) => f !== 'phoneCountry'));
  });

  it('counts age by birthday', () => {
    expect(ageOn('2010-11-10', today)).toBe(15);
    expect(ageOn('2010-11-09', today)).toBe(16);
    expect(validateDetails({ ...valid, birthDate: '2010-11-10' }, today).birthDate).toBe('You must be 16 or older to join');
  });

  it('explains a bad IBAN', () => {
    expect(validateDetails({ ...valid, iban: 'NL00TEST0123456789' }, today).iban).toBe('This IBAN is not valid. Check it for typos');
  });
});

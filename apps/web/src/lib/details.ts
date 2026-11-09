import { isValidBic, validateIban, type IbanError } from './iban';

export interface Details {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phoneCountry: string;
  phone: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;
  country: string;
  iban: string;
  bic: string;
  bankName: string;
  consent: boolean;
}

export type DetailsField = keyof Details;
export type DetailsErrors = Partial<Record<DetailsField, string>>;

/** Form order; the error summary lists errors in this order. */
export const FIELD_ORDER: DetailsField[] = [
  'firstName', 'lastName', 'birthDate', 'email', 'phoneCountry', 'phone',
  'street', 'houseNumber', 'postcode', 'city', 'country', 'iban', 'bic', 'bankName', 'consent',
];

export const MIN_AGE = 16;

export function emptyDetails(): Details {
  return {
    firstName: '', lastName: '', birthDate: '', email: '', phoneCountry: '+31', phone: '',
    street: '', houseNumber: '', postcode: '', city: '', country: '', iban: '', bic: '', bankName: '', consent: false,
  };
}

const IBAN_MESSAGES: Record<IbanError, string> = {
  required: 'Enter your IBAN',
  characters: 'An IBAN has only letters and numbers',
  country: 'Enter an IBAN from the Netherlands, Germany or Belgium',
  length: 'This IBAN has the wrong number of characters for its country',
  checksum: 'This IBAN is not valid. Check it for typos',
};

export function ageOn(birthDate: string, today: Date): number {
  const [y, m, d] = birthDate.split('-').map(Number) as [number, number, number];
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age;
}

export function validateField(field: DetailsField, d: Details, today = new Date()): string | undefined {
  const blank = (v: string) => !v.trim();
  switch (field) {
    case 'firstName':
      return blank(d.firstName) ? 'Enter your first name' : undefined;
    case 'lastName':
      return blank(d.lastName) ? 'Enter your last name' : undefined;
    case 'birthDate':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d.birthDate)) return 'Enter your date of birth';
      if (ageOn(d.birthDate, today) < MIN_AGE) return `You must be ${MIN_AGE} or older to join`;
      if (ageOn(d.birthDate, today) > 120) return 'Check the year of your date of birth';
      return undefined;
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()) ? undefined : 'Enter an email address like name@example.com';
    case 'phoneCountry':
      return blank(d.phoneCountry) ? 'Choose a country code' : undefined;
    case 'phone':
      return /^\d{6,12}$/.test(d.phone.replace(/\s+/g, '')) ? undefined : 'Enter a mobile number of 6 to 12 digits';
    case 'street':
      return blank(d.street) ? 'Enter your street' : undefined;
    case 'houseNumber':
      return blank(d.houseNumber) ? 'Enter your house number' : undefined;
    case 'postcode':
      return blank(d.postcode) ? 'Enter your postcode' : undefined;
    case 'city':
      return blank(d.city) ? 'Enter your town or city' : undefined;
    case 'country':
      return blank(d.country) ? 'Choose your country' : undefined;
    case 'iban': {
      const error = validateIban(d.iban);
      return error ? IBAN_MESSAGES[error] : undefined;
    }
    case 'bic':
      return isValidBic(d.bic) ? undefined : 'Enter a BIC of 8 or 11 characters';
    case 'bankName':
      return blank(d.bankName) ? 'Enter the name of your bank' : undefined;
    case 'consent':
      return d.consent ? undefined : 'Agree to the terms and the direct debit to continue';
  }
}

export function validateDetails(d: Details, today = new Date()): DetailsErrors {
  const errors: DetailsErrors = {};
  for (const field of FIELD_ORDER) {
    const message = validateField(field, d, today);
    if (message) errors[field] = message;
  }
  return errors;
}

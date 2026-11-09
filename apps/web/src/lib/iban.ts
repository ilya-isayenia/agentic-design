import { BANKS, IBAN_FORMATS } from '@web/data/banks';

export function normalizeIban(input: string): string {
  return input.replace(/\s+/g, '').toUpperCase();
}

/** Groups of four, as printed on cards and statements. */
export function formatIban(input: string): string {
  return normalizeIban(input).replace(/(.{4})(?=.)/g, '$1 ');
}

/** ISO 13616 check: move the first four characters to the end, letters to numbers, remainder mod 97 must be 1. */
export function hasValidChecksum(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const digits = /[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of digits) remainder = (remainder * 10 + Number(d)) % 97;
  }
  return remainder === 1;
}

export type IbanError = 'required' | 'country' | 'length' | 'characters' | 'checksum';

export function validateIban(input: string): IbanError | null {
  const iban = normalizeIban(input);
  if (!iban) return 'required';
  if (!/^[A-Z0-9]+$/.test(iban)) return 'characters';
  const format = IBAN_FORMATS[iban.slice(0, 2)];
  if (!format) return 'country';
  if (iban.length !== format.length) return 'length';
  if (!hasValidChecksum(iban)) return 'checksum';
  return null;
}

/** BIC and bank name for a valid IBAN; null when the bank is not in the list (the user types them). */
export function lookupBank(input: string): { bic: string; name: string } | null {
  const iban = normalizeIban(input);
  if (validateIban(iban)) return null;
  const country = iban.slice(0, 2);
  const format = IBAN_FORMATS[country];
  if (!format) return null;
  return BANKS[`${country}:${iban.slice(...format.bankCode)}`] ?? null;
}

export function isValidBic(input: string): boolean {
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(input.trim().toUpperCase());
}

// Invented banks, keyed by country and the bank code inside the IBAN. Used to fill BIC and bank name.
export const BANKS: Record<string, { bic: string; name: string }> = {
  'NL:TEST': { bic: 'TESTNL2A', name: 'Test Bank (fake)' },
  'NL:DEMO': { bic: 'DEMONL2A', name: 'Demo Savings (fake)' },
  'DE:99999999': { bic: 'TESTDEFF', name: 'Beispielbank (fake)' },
};

/** IBAN length and where the bank code sits after the 4-character prefix. */
export const IBAN_FORMATS: Record<string, { length: number; bankCode: [number, number] }> = {
  NL: { length: 18, bankCode: [4, 8] },
  DE: { length: 22, bankCode: [4, 12] },
  BE: { length: 16, bankCode: [4, 7] },
};

/** Visibly fake IBANs with valid check digits, for tests and docs. */
export const TEST_IBANS = { nl: 'NL13TEST0123456789', nlDemo: 'NL45DEMO0987654321', de: 'DE37999999990123456789', unknownBank: 'BE68000123456789' };

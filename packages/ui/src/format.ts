// Money is held in cents to avoid floating-point drift; shown in euros.
const money = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
const moneyFixed = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Whole amounts without decimals (€36), others with two (€49.50). */
export function formatMoney(cents: number): string {
  return cents % 100 === 0 ? money.format(cents / 100) : moneyFixed.format(cents / 100);
}

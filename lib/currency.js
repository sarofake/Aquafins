export const DEFAULT_CURRENCY = 'BDT';
export const CURRENCY_SYMBOL = '৳';

export function formatPrice(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${CURRENCY_SYMBOL}${amount}`;
  const grouped = new Intl.NumberFormat('en-IN').format(value);
  return `${CURRENCY_SYMBOL}${grouped}`;
}
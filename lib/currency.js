export const DEFAULT_CURRENCY = 'BDT';
export const CURRENCY_SYMBOL = '৳';

/**
 * Formats a price with the deployment's currency symbol.
 *
 * The symbol lives in Admin → Site Info → Currency & Colors, so a store that
 * sells in a different currency does not have to edit code. Pass `symbol`
 * explicitly (components read it through `useCurrency()`); without it the
 * template default is used.
 */
export function formatPrice(amount, symbol = CURRENCY_SYMBOL) {
  const value = Number(amount);
  const prefix = String(symbol || CURRENCY_SYMBOL);
  if (!Number.isFinite(value)) return `${prefix}${amount}`;
  const grouped = new Intl.NumberFormat('en-IN').format(value);
  return `${prefix}${grouped}`;
}

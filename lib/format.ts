/**
 * Formats a number as a plain integer string with grouping.
 */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/**
 * Formats a number with a fixed number of decimal digits (default 1).
 */
export function formatDecimal(value: number, digits = 1): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/**
 * Formats a number as a percentage string with one decimal place.
 */
export function formatPercent(value: number): string {
  return `${formatDecimal(value)}%`;
}

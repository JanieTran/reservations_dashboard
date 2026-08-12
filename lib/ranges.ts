export interface DateRange {
  /** First day of the current period (inclusive). */
  currentStart: Date;
  /** Last day of the current period (inclusive). */
  currentEnd: Date;
  /** First day of the previous period (inclusive). */
  previousStart: Date;
  /** Last day of the previous period (inclusive). */
  previousEnd: Date;
}

/**
 * Formats a date as a local YYYY-MM-DD string (not UTC).
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Returns the default date range for the dashboard: the last 7 days (ending
 * yesterday) as the current period and the 7 days before as the previous
 * one. Ends are the inclusive last day of each period.
 */
export function getDefaultDateRange(): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentStart = new Date(today.getTime() - 7 * DAY_IN_MS);
  const currentEnd = new Date(today.getTime() - DAY_IN_MS);
  const previousStart = new Date(today.getTime() - 14 * DAY_IN_MS);
  const previousEnd = new Date(currentStart.getTime() - DAY_IN_MS);

  return { currentStart, currentEnd, previousStart, previousEnd };
}

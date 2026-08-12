export interface DateRange {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
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

/**
 * Returns the default date range for the dashboard: yesterday as the
 * current period and the day before as the previous one. Bounds are
 * half-open timestamps at local midnight.
 */
export function getDefaultDateRange(): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const currentStart = yesterday;
  const currentEnd = new Date(currentStart.getTime() + 24 * 60 * 60 * 1000);
  const previousStart = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000);
  const previousEnd = currentStart;

  return { currentStart, currentEnd, previousStart, previousEnd };
}

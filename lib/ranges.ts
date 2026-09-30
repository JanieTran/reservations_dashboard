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

export type DateRangePreset = "week" | "month" | "quarter" | "year";

const DATE_TIME_ZONE = "Asia/Ho_Chi_Minh";

/**
 * Formats a date as a local YYYY-MM-DD string (not UTC).
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDateRangePreset(value: unknown): value is DateRangePreset {
  return (
    value === "week" ||
    value === "month" ||
    value === "quarter" ||
    value === "year"
  );
}

function vietnamCalendarDate(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DATE_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  // Rebuild Vietnam's Y-M-D as local midnight so toDateKey's local getters
  // return those same calendar parts even when the server runs in another zone.
  return new Date(Number(values.year), Number(values.month) - 1, Number(values.day));
}

function shiftDays(date: Date, days: number): Date {
  const shifted = new Date(date);
  // Calendar arithmetic avoids fixed-millisecond shifts crossing DST boundaries.
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

function shiftMonthsClamped(date: Date, months: number): Date {
  // Start from day one because changing months directly can roll Mar 31 into March.
  const shifted = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    shifted.getFullYear(),
    shifted.getMonth() + 1,
    0
  ).getDate();
  shifted.setDate(Math.min(date.getDate(), lastDay));
  return shifted;
}

/**
 * Builds inclusive current and previous comparison ranges using Vietnam
 * calendar dates, matching the UTC+7 date conversion in dashboard SQL. The
 * previous range covers the same point in its matching calendar period.
 */
export function getDateRange(
  preset: DateRangePreset,
  now: Date = new Date()
): DateRange {
  const currentEnd = vietnamCalendarDate(now);
  let currentStart: Date;
  let previousStart: Date;
  let previousEnd: Date;

  if (preset === "week") {
    // JavaScript numbers Sunday as 0; convert it to days since Monday (0..6).
    const daysSinceMonday = (currentEnd.getDay() + 6) % 7;
    currentStart = shiftDays(currentEnd, -daysSinceMonday);
    previousStart = shiftDays(currentStart, -7);
    previousEnd = shiftDays(currentEnd, -7);
  } else {
    // Quarter/year presets use the same month arithmetic as month, in groups
    // of three or twelve months respectively.
    const monthsPerPeriod = preset === "month" ? 1 : preset === "quarter" ? 3 : 12;
    const firstMonth =
      preset === "quarter"
        ? Math.floor(currentEnd.getMonth() / 3) * 3
        : preset === "year"
          ? 0
          : currentEnd.getMonth();

    currentStart = new Date(currentEnd.getFullYear(), firstMonth, 1);
    // Compare against the same calendar boundary and point in the prior period.
    previousStart = new Date(
      currentStart.getFullYear(),
      currentStart.getMonth() - monthsPerPeriod,
      1
    );
    previousEnd = shiftMonthsClamped(currentEnd, -monthsPerPeriod);
  }

  return { currentStart, currentEnd, previousStart, previousEnd };
}

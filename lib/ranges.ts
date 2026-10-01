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

type DateRangeUnit = "week" | "month" | "quarter" | "year";

export type DateRangePreset = DateRangeUnit | `last-${DateRangeUnit}`;

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
    value === "year" ||
    value === "last-week" ||
    value === "last-month" ||
    value === "last-quarter" ||
    value === "last-year"
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

/**
 * Shifts a date by a specified number of days, preserving the time of day.
 */
function shiftDays(date: Date, days: number): Date {
  const shifted = new Date(date);
  // Calendar arithmetic avoids fixed-millisecond shifts crossing DST boundaries.
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

/**
 * Shifts a date by a specified number of months,
 * clamping the day to the new month's last day if necessary.
 */
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
  const today = vietnamCalendarDate(now);
  const isLastPeriod = preset.startsWith("last-");
  const unit = (isLastPeriod ? preset.slice(5) : preset) as DateRangeUnit;
  let currentStart: Date;
  let currentEnd: Date;
  let previousStart: Date;
  let previousEnd: Date;

  if (unit === "week") {
    // JavaScript numbers Sunday as 0; convert it to days since Monday (0..6).
    const daysSinceMonday = (today.getDay() + 6) % 7;
    const startOfCurrentWeek = shiftDays(today, -daysSinceMonday);

    if (isLastPeriod) {
      currentStart = shiftDays(startOfCurrentWeek, -7);
      currentEnd = shiftDays(startOfCurrentWeek, -1);
      previousStart = shiftDays(currentStart, -7);
      previousEnd = shiftDays(currentEnd, -7);
    } else {
      currentStart = startOfCurrentWeek;
      currentEnd = today;
      previousStart = shiftDays(currentStart, -7);
      previousEnd = shiftDays(currentEnd, -7);
    }
  } else {
    const monthsPerPeriod = unit === "month" ? 1 : unit === "quarter" ? 3 : 12;
    // Start from the first month of the current period (Jan, Apr, Jul, Oct for quarters).
    const firstMonth =
      unit === "quarter"
        ? Math.floor(today.getMonth() / 3) * 3
        : unit === "year"
          ? 0
          : today.getMonth();
    const startOfCurrentPeriod = new Date(today.getFullYear(), firstMonth, 1);

    // Full latest period preceding today
    if (isLastPeriod) {
      currentStart = new Date(
        startOfCurrentPeriod.getFullYear(),
        startOfCurrentPeriod.getMonth() - monthsPerPeriod,
        1
      );
      currentEnd = shiftDays(startOfCurrentPeriod, -1);
      previousStart = new Date(
        currentStart.getFullYear(),
        currentStart.getMonth() - monthsPerPeriod,
        1
      );
      previousEnd = shiftDays(currentStart, -1);
    } 
    // Partial current period up to today
    else {
      currentStart = startOfCurrentPeriod;
      currentEnd = today;
      previousStart = new Date(
        currentStart.getFullYear(),
        currentStart.getMonth() - monthsPerPeriod,
        1
      );
      previousEnd = shiftMonthsClamped(today, -monthsPerPeriod);
    }
  }

  return { currentStart, currentEnd, previousStart, previousEnd };
}

import type {
  BookingChannelRatePoint,
  BookingChannelRateRow,
  BreakdownPoint,
  BreakdownRow,
  DailyPoint,
  DailyRow,
  HeatmapPoint,
  HeatmapRow,
  KpiData,
  KpiPeriod,
  KpiRow,
  PartySizePoint,
  PartySizeRow,
} from "./dashboard-types";

function toNumber(value: number | string | null | undefined): number {
  return Number(value ?? 0);
}

export function breakdownFromRows(
  rows: BreakdownRow[],
  labelKey: string
): BreakdownPoint[] {
  return rows.map((row) => ({
    label: String(row[labelKey]),
    reservations: toNumber(row.reservations),
  }));
}

export function dailyFromRows(rows: DailyRow[]): DailyPoint[] {
  return rows.map((row) => ({
    date: row.date,
    reservations: toNumber(row.reservations),
    guests: toNumber(row.guests),
  }));
}

export function heatmapFromRows(rows: HeatmapRow[]): HeatmapPoint[] {
  return rows.map((row) => ({
    weekday: toNumber(row.weekday),
    weekday_char: row.weekday_char,
    hour: toNumber(row.hour),
    reservations: toNumber(row.reservations),
  }));
}

function zeroedPeriod(period: "current" | "previous"): KpiPeriod {
  return {
    period,
    total_bookings: 0,
    total_guests: 0,
    average_guests: 0,
    reservation_rate: 0,
    cancelled_reservations: 0,
    cancellation_rate: 0,
  };
}

function toKpiPeriod(row: KpiRow): KpiPeriod {
  return {
    period: row.period,
    total_bookings: toNumber(row.total_bookings),
    total_guests: toNumber(row.total_guests),
    average_guests: toNumber(row.average_guests ?? 0),
    reservation_rate: toNumber(row.reservation_rate),
    cancelled_reservations: toNumber(row.cancelled_reservations),
    cancellation_rate: toNumber(row.cancellation_rate),
  };
}

export function kpisFromRows(rows: KpiRow[]): KpiData {
  const currentRow = rows.find((row) => row.period === "current");
  const previousRow = rows.find((row) => row.period === "previous");

  return {
    current: currentRow ? toKpiPeriod(currentRow) : zeroedPeriod("current"),
    previous: previousRow ? toKpiPeriod(previousRow) : zeroedPeriod("previous"),
  };
}

export function partySizeFromRows(rows: PartySizeRow[]): PartySizePoint[] {
  return rows.map((row) => ({
    number_of_people: toNumber(row.number_of_people),
    reservations: toNumber(row.reservations),
  }));
}

export function bookingChannelRatesFromRows(
  rows: BookingChannelRateRow[]
): BookingChannelRatePoint[] {
  return rows.map((row) => ({
    booking_channel: row.booking_channel,
    cancel_or_no_show_rate: toNumber(row.cancel_or_no_show_rate),
  }));
}

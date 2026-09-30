import { toDateKey } from "@/lib/ranges";

import type {
  BookingChannelRatePoint,
  BookingChannelRateRow,
  BookingCustomerGenderPoint,
  BookingCustomerGenderRow,
  BreakdownPoint,
  BreakdownRow,
  CancelRatePoint,
  CancelRateRow,
  CancelReasonsCountRow,
  CustomerNationalityPoint,
  CustomerNationalityRow,
  CustomerTypeChannelPoint,
  CustomerTypeLocationPoint,
  CustomerTypeRow,
  DailyPoint,
  DailyRow,
  HeatmapPoint,
  HeatmapRow,
  KpiData,
  KpiPeriod,
  KpiRow,
  PartySizePoint,
  PartySizeRow,
  TableUtilisationHeatmapData,
  TableUtilisationRow,
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
  const currentRows = rows
    .filter((row) => row.period === "current")
    .sort((a, b) => a.date.localeCompare(b.date));
  const previousRows = rows
    .filter((row) => row.period === "previous")
    .sort((a, b) => a.date.localeCompare(b.date));

  return currentRows.map((row, index) => {
    const previousRow = previousRows[index] ?? {
      date: row.date,
      reservations: "0",
      guests: "0",
    };

    return {
      date: row.date,
      currentBookings: toNumber(row.reservations),
      previousBookings: toNumber(previousRow.reservations),
      currentGuests: toNumber(row.guests),
      previousGuests: toNumber(previousRow.guests),
    };
  });
}

export function heatmapFromRows(rows: HeatmapRow[]): HeatmapPoint[] {
  return rows.map((row) => ({
    weekday: toNumber(row.weekday),
    weekday_char: row.weekday_char,
    hour: toNumber(row.hour),
    reservations: toNumber(row.reservations),
  }));
}

export function tableUtilisationHeatmapFromRows(
  rows: TableUtilisationRow[],
  startDate: Date,
  endDate: Date
): TableUtilisationHeatmapData {
  const dates: string[] = [];
  const dateCursor = new Date(startDate);
  dateCursor.setHours(0, 0, 0, 0);
  const lastDate = new Date(endDate);
  lastDate.setHours(0, 0, 0, 0);

  while (dateCursor <= lastDate) {
    dates.push(toDateKey(dateCursor));
    dateCursor.setDate(dateCursor.getDate() + 1);
  }

  const ratesByLocation = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const locationName = String(row.service_location_name ?? "Unknown");
    let ratesByDate = ratesByLocation.get(locationName);
    if (!ratesByDate) {
      ratesByDate = new Map();
      ratesByLocation.set(locationName, ratesByDate);
    }
    ratesByDate.set(
      String(row.booking_date).slice(0, 10),
      toNumber(row.table_utilisation_rate)
    );
  }

  const locations = [...ratesByLocation.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([service_location_name, ratesByDate]) => ({
      service_location_name,
      utilisation_rates: dates.map((date) => ratesByDate.get(date) ?? 0),
    }));

  return { dates, locations };
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
    banquet_type: row.banquet_type ?? "Unknown",
    average_party_size: toNumber(row.average_party_size),
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

export function cancelRatesFromRows(
  rows: CancelRateRow[],
  labelKey: "booking_channel" | "service_location_name" | "event_type" | "banquet_type"
): CancelRatePoint[] {
  return rows.map((row) => ({
    label: String(row[labelKey] ?? "Unknown"),
    cancel_rate: toNumber(row.cancel_rate),
  }));
}

export function cancelReasonsCountFromRows(
  rows: CancelReasonsCountRow[]
): BreakdownPoint[] {
  return rows.map((row) => ({
    label: String(row.cancel_reason ?? "Unknown"),
    reservations: toNumber(row.reservations),
  }));
}

export function customerTypeByLocationFromRows(
  rows: CustomerTypeRow[]
): CustomerTypeLocationPoint[] {
  return rows
    .map((row) => {
      return {
        service_location_name: String(row.service_location_name ?? "Unknown"),
        new_count: toNumber(row.new_count ?? 0),
        returning_count: toNumber(row.returning_count ?? 0),
        new_rate: toNumber(row.new_rate ?? 0),
        returning_rate: toNumber(row.returning_rate ?? 0),
      };
    })
}

export function customerTypeByChannelFromRows(
  rows: CustomerTypeRow[]
): CustomerTypeChannelPoint[] {
  return rows.map((row) => ({
    booking_channel: String(row.booking_channel ?? "Unknown"),
    new_count: toNumber(row.new_count ?? 0),
    returning_count: toNumber(row.returning_count ?? 0),
    new_rate: toNumber(row.new_rate ?? 0),
    returning_rate: toNumber(row.returning_rate ?? 0),
  }));
}

export function customerNationalityFromRows(
  rows: CustomerNationalityRow[]
): CustomerNationalityPoint[] {
  return rows.map((row) => ({
    service_location_name: String(row.service_location_name ?? "Unknown"),
    vietnamese_count: toNumber(row.vietnamese_count ?? 0),
    foreigner_count: toNumber(row.foreigner_count ?? 0),
    vietnamese_rate: toNumber(row.vietnamese_rate ?? 0),
    foreigner_rate: toNumber(row.foreigner_rate ?? 0),
  }));
}

export function bookingCustomerGenderFromRows(
  rows: BookingCustomerGenderRow[]
): BookingCustomerGenderPoint[] {
  return rows.map((row) => ({
    service_location_name: String(row.service_location_name ?? "Unknown"),
    female_count: toNumber(row.female_count ?? 0),
    male_count: toNumber(row.male_count ?? 0),
    female_rate: toNumber(row.female_rate ?? 0),
    male_rate: toNumber(row.male_rate ?? 0),
  }));
}

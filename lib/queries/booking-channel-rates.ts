// ---- types ----

export interface BookingChannelRateRow {
  booking_channel: string;
  cancel_or_no_show_rate: number | string | null;
}

export interface BookingChannelRatePoint {
  booking_channel: string;
  cancel_or_no_show_rate: number;
}

// ---- parsing ----

export function bookingChannelRatesFromRows(
  rows: BookingChannelRateRow[]
): BookingChannelRatePoint[] {
  return rows.map((row) => ({
    booking_channel: row.booking_channel,
    cancel_or_no_show_rate: Number(row.cancel_or_no_show_rate ?? 0),
  }));
}

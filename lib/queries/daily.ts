// ---- types ----

export interface DailyRow {
  date: string;
  reservations: string;
  guests: string;
}

export interface DailyPoint {
  date: string;
  reservations: number;
  guests: number;
}

// ---- parsing ----

/**
 * Maps the daily section rows to DailyPoint values, parsing the numeric
 * fields (returned as strings by pg). Row order is preserved as returned
 * by the query.
 */
export function dailyFromRows(rows: DailyRow[]): DailyPoint[] {
  return rows.map((row) => ({
    date: row.date,
    reservations: Number(row.reservations),
    guests: Number(row.guests),
  }));
}

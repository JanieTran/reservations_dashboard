// ---- types ----

export interface BreakdownRow {
  [labelColumn: string]: string;
}

export interface BreakdownPoint {
  label: string;
  reservations: number;
}

// ---- parsing ----

/**
 * Maps a breakdown section's rows (e.g. booking channel, customer type, or
 * gender) to BreakdownPoint values. labelKey names the row column holding the
 * category label (the SQL emits it under the section's own name, not "label").
 * Parses the numeric reservations field (returned as a string by pg). Row
 * order is preserved as returned by the query.
 */
export function breakdownFromRows(
  rows: BreakdownRow[],
  labelKey: string
): BreakdownPoint[] {
  return rows.map((row) => ({
    label: String(row[labelKey]),
    reservations: Number(row.reservations),
  }));
}

// ---- types ----

export interface HeatmapRow {
  weekday: string;
  weekday_char: string;
  hour: string;
  reservations: string;
}

export interface HeatmapPoint {
  weekday: number;
  weekday_char: string;
  hour: number;
  reservations: number;
}

// ---- parsing ----

/**
 * Maps the heatmap section rows to HeatmapPoint values, parsing the numeric
 * fields (returned as strings by pg). Row order is preserved as returned by
 * the query.
 */
export function heatmapFromRows(rows: HeatmapRow[]): HeatmapPoint[] {
  return rows.map((row) => ({
    weekday: Number(row.weekday),
    weekday_char: row.weekday_char,
    hour: Number(row.hour),
    reservations: Number(row.reservations),
  }));
}

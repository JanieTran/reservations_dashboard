// ---- types ----

export interface PartySizeRow {
  number_of_people: string;
  reservations: string;
}

export interface PartySizePoint {
  number_of_people: number;
  reservations: number;
}

// ---- parsing ----

/**
 * Maps the party size section rows to PartySizePoint values, parsing the
 * numeric fields (returned as strings by pg). Row order is preserved as
 * returned by the query.
 */
export function partySizeFromRows(rows: PartySizeRow[]): PartySizePoint[] {
  return rows.map((row) => ({
    number_of_people: Number(row.number_of_people),
    reservations: Number(row.reservations),
  }));
}

// ---- public types ----

export interface KpiPeriod {
  period: "current" | "previous";
  total_reservations: number;
  total_guests: number;
  average_guests: number;
  cancelled_reservations: number;
  cancellation_rate: number;
  no_show_reservations: number;
  no_show_rate: number;
}

export interface KpiData {
  current: KpiPeriod;
  previous: KpiPeriod;
}

// ---- sample data ----

export const SAMPLE_KPI_DATA: KpiData = {
  current: {
    period: "current",
    total_reservations: 82,
    total_guests: 463,
    average_guests: 5.65,
    cancelled_reservations: 11,
    cancellation_rate: 13.41,
    no_show_reservations: 3,
    no_show_rate: 3.66,
  },
  previous: {
    period: "previous",
    total_reservations: 89,
    total_guests: 364,
    average_guests: 4.09,
    cancelled_reservations: 8,
    cancellation_rate: 8.99,
    no_show_reservations: 2,
    no_show_rate: 2.25,
  },
};

// ---- row mapping ----

export interface KpiRow {
  period: "current" | "previous";
  total_reservations: string;
  total_guests: string;
  average_guests: string;
  cancelled_reservations: string;
  cancellation_rate: string;
  no_show_reservations: string;
  no_show_rate: string;
}

/** Returns a KPI period with all metrics zeroed out. */
function zeroedPeriod(period: "current" | "previous"): KpiPeriod {
  return {
    period,
    total_reservations: 0,
    total_guests: 0,
    average_guests: 0,
    cancelled_reservations: 0,
    cancellation_rate: 0,
    no_show_reservations: 0,
    no_show_rate: 0,
  };
}

/** Converts a query row (numeric values returned as strings) to a KpiPeriod. */
function toKpiPeriod(row: KpiRow): KpiPeriod {
  return {
    period: row.period,
    total_reservations: Number(row.total_reservations),
    total_guests: Number(row.total_guests),
    average_guests: Number(row.average_guests),
    cancelled_reservations: Number(row.cancelled_reservations),
    cancellation_rate: Number(row.cancellation_rate),
    no_show_reservations: Number(row.no_show_reservations),
    no_show_rate: Number(row.no_show_rate),
  };
}

/**
 * Maps the KPI section rows to a KpiData object, zeroing missing periods.
 */
export function kpisFromRows(rows: KpiRow[]): KpiData {
  const currentRow = rows.find((row) => row.period === "current");
  const previousRow = rows.find((row) => row.period === "previous");

  return {
    current: currentRow ? toKpiPeriod(currentRow) : zeroedPeriod("current"),
    previous: previousRow ? toKpiPeriod(previousRow) : zeroedPeriod("previous"),
  };
}

import { query } from "@/lib/db";
import { toDateKey, type DateRange } from "@/lib/ranges";

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

// ---- query ----
const SERVICE_LOCATION_ID = "7c2c329c-1fb8-45ba-94bd-128b23c8c2e9";
const DINE_IN_TYPE = "booking";
const KPI_SQL = `
  WITH filtered_bookings AS (
    SELECT
      BK.status
      ,BK.number_of_people
      ,BK.dine_in_type
      ,BK.reserved_at + INTERVAL '7 hours' AS reserved_at
      ,CASE
        WHEN DATE(reserved_at + INTERVAL '7 hours')
          BETWEEN $1 AND $2
        THEN 'current'
        WHEN DATE(reserved_at + INTERVAL '7 hours')
          BETWEEN $3 AND $4
        THEN 'previous'
      END AS period
    FROM bookings AS BK
    WHERE
      BK.is_test = FALSE
      AND DATE(BK.reserved_at + INTERVAL '7 hours') BETWEEN $3 AND $2
      AND BK.service_location_id = '${SERVICE_LOCATION_ID}'
      AND BK.dine_in_type = '${DINE_IN_TYPE}'
  )
  SELECT
    period
    ,COUNT(*) AS total_reservations
    ,COALESCE(SUM(number_of_people), 0) AS total_guests
    ,ROUND(AVG(number_of_people), 2) AS average_guests
    ,COUNT(*) FILTER (
      WHERE status = 'cancelled'
    ) AS cancelled_reservations
    ,ROUND(
      COUNT(*) FILTER (WHERE status = 'cancelled')
      * 100.0
      / NULLIF(COUNT(*), 0),
      2
    ) AS cancellation_rate
    ,COUNT(*) FILTER (
      WHERE status = 'no_show'
    ) AS no_show_reservations
    ,ROUND(
      COUNT(*) FILTER (WHERE status = 'no_show')
      * 100.0
      / NULLIF(COUNT(*), 0),
      2
    ) AS no_show_rate
  FROM filtered_bookings
  GROUP BY 1
`;

// ---- row mapping ----

interface KpiRow {
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

// ---- public api ----

/**
 * Fetches the KPI summary (reservations, guests, avg party size, cancellation
 * and no-show rates) for the current and previous periods via a single
 * aggregated SQL query. Missing periods are returned zeroed.
 */
export async function getKpiData(range: DateRange): Promise<KpiData> {
  const rows = (
    await query<KpiRow>(KPI_SQL, [
      toDateKey(range.currentStart),
      toDateKey(range.currentEnd),
      toDateKey(range.previousStart),
      toDateKey(range.previousEnd),
    ])
  ).rows;

  const currentRow = rows.find((row) => row.period === "current");
  const previousRow = rows.find((row) => row.period === "previous");

  return {
    current: currentRow ? toKpiPeriod(currentRow) : zeroedPeriod("current"),
    previous: previousRow ? toKpiPeriod(previousRow) : zeroedPeriod("previous"),
  };
}

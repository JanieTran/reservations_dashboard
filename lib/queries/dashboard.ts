import { query } from "@/lib/db";
import { toDateKey, type DateRange } from "@/lib/ranges";

import {
  dailyFromRows,
  type DailyPoint,
  type DailyRow,
} from "./daily";
import {
  heatmapFromRows,
  type HeatmapPoint,
  type HeatmapRow,
} from "./heatmap";
import {
  kpisFromRows,
  type KpiData,
  type KpiRow,
} from "./kpis";
import {
  partySizeFromRows,
  type PartySizePoint,
  type PartySizeRow,
} from "./party-size";

// ---- types ----

interface DashboardPayload {
  kpi: KpiRow[];
  daily: DailyRow[];
  heatmap: HeatmapRow[];
  party_size: PartySizeRow[];
}

export interface DashboardData {
  kpi: KpiData;
  daily: DailyPoint[];
  heatmap: HeatmapPoint[];
  party_size: PartySizePoint[];
}

// ---- query ----

const SERVICE_LOCATION_ID = "7c2c329c-1fb8-45ba-94bd-128b23c8c2e9";
const DINE_IN_TYPE = "booking";
const DASHBOARD_SQL = `
  WITH filtered_bookings AS (
    SELECT
      BK.status
      ,BK.number_of_people
      ,BK.reserved_at + INTERVAL '7 hours' AS reserved_at
      ,EXTRACT(ISODOW FROM BK.reserved_at) AS weekday
      ,CONCAT(EXTRACT(ISODOW FROM BK.reserved_at), ' - ', LEFT(TO_CHAR(BK.reserved_at, 'Day'), 3)) AS weekday_char
      ,EXTRACT(HOUR FROM BK.reserved_at + INTERVAL '7 hours')   AS hour
      ,INITCAP(BK.booking_channel) AS booking_channel
      ,MC.name AS merchant_name
      ,SL.name AS service_location_name
      ,CASE
        WHEN EXTRACT(EPOCH FROM (BK.reserved_at - BK.inserted_at)) / 86400.0 < 1 THEN '[0] Same day'
        WHEN EXTRACT(EPOCH FROM (BK.reserved_at - BK.inserted_at)) / 86400.0 < 2 THEN '[1] 1 day'
        WHEN EXTRACT(EPOCH FROM (BK.reserved_at - BK.inserted_at)) / 86400.0 < 4 THEN '[2] 2-3 days'
        WHEN EXTRACT(EPOCH FROM (BK.reserved_at - BK.inserted_at)) / 86400.0 < 7 THEN '[3] 1 week'
        WHEN EXTRACT(EPOCH FROM (BK.reserved_at - BK.inserted_at)) / 86400.0 < 30 THEN '[4] 1 month'
        WHEN EXTRACT(EPOCH FROM (BK.reserved_at - BK.inserted_at)) / 86400.0 < 90 THEN '[5] 1 quarter'
        WHEN EXTRACT(EPOCH FROM (BK.reserved_at - BK.inserted_at)) / 86400.0 < 180 THEN '[6] Half year'
        WHEN EXTRACT(EPOCH FROM (BK.reserved_at - BK.inserted_at)) / 86400.0 < 365 THEN '[7] 1 year'
        ELSE '8 - More than 1 year'
      END AS lead_time
      ,CASE
        WHEN BK.customer_id IS NULL THEN 'New'
        ELSE 'Returning'
      END AS customer_type
      ,CASE
        WHEN LOWER(SPLIT_PART(BK.guest_fullname, ' ', 1)) IN ('anh', 'mr') THEN 'Male'
        WHEN LOWER(SPLIT_PART(BK.guest_fullname, ' ', 1)) IN ('chi', 'chị', 'ms') THEN 'Female'
        ELSE NULL
      END AS booking_customer_gender
      ,CASE
        WHEN DATE(BK.reserved_at + INTERVAL '7 hours')
          BETWEEN $1 AND $2
        THEN 'current'
        WHEN DATE(BK.reserved_at + INTERVAL '7 hours')
          BETWEEN $3 AND $4
        THEN 'previous'
      END AS period
    FROM public.bookings AS BK
    LEFT JOIN public.merchants AS MC ON BK.merchant_id = MC.id
    LEFT JOIN public.service_locations AS SL ON BK.service_location_id = SL.id
    WHERE
      BK.is_test = FALSE
      AND DATE(BK.reserved_at + INTERVAL '7 hours') BETWEEN $3 AND $2
      AND BK.service_location_id = '${SERVICE_LOCATION_ID}'
      AND BK.dine_in_type = '${DINE_IN_TYPE}'
  )
  ,daily AS (
    SELECT
      DATE(reserved_at) AS date
      ,COUNT(*) AS reservations
      ,SUM(number_of_people) AS guests
    FROM filtered_bookings
    GROUP BY 1
  )
  ,heatmap AS (
    SELECT
      EXTRACT(ISODOW FROM reserved_at) AS weekday
      ,TO_CHAR(reserved_at, 'Day')      AS weekday_char
      ,EXTRACT(HOUR FROM reserved_at)   AS hour
      ,COUNT(*)                         AS reservations
    FROM filtered_bookings
    GROUP BY 1, 2, 3
  )
  ,kpi AS (
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
  )
  ,party_size AS (
    SELECT
      number_of_people
      ,COUNT(*) AS reservations
    FROM filtered_bookings
    GROUP BY 1
  )
  SELECT
    json_build_object(
      'kpi'
      ,(SELECT json_agg(kpi) FROM kpi)
      ,'daily'
      ,(SELECT json_agg(daily ORDER BY date) FROM daily)
      ,'heatmap'
      ,(SELECT json_agg(heatmap ORDER BY weekday, hour) FROM heatmap)
      ,'party_size'
      ,(SELECT json_agg(party_size ORDER BY number_of_people) FROM party_size)
    ) AS data
`;

// ---- public api ----

/**
 * Fetches all dashboard sections (KPI summary, daily trend, heatmap, and
 * party size distribution) in a single query and returns them as typed data.
 * Missing sections are returned as empty/zeroed fallbacks.
 */
export async function getDashboardData(
  range: DateRange
): Promise<DashboardData> {
  // The range ends are the inclusive last days of each period, matching the
  // SQL's inclusive BETWEEN.
  const row = (
    await query<{ data: DashboardPayload | string | null }>(DASHBOARD_SQL, [
      toDateKey(range.currentStart),
      toDateKey(range.currentEnd),
      toDateKey(range.previousStart),
      toDateKey(range.previousEnd),
    ])
  ).rows[0];

  const payload = parsePayload(row?.data);

  return {
    kpi: kpisFromRows(payload?.kpi ?? []),
    daily: dailyFromRows(payload?.daily ?? []),
    heatmap: heatmapFromRows(payload?.heatmap ?? []),
    party_size: partySizeFromRows(payload?.party_size ?? []),
  };
}

/**
 * Normalizes the data column, parsing it when pg returns it as a JSON string.
 */
function parsePayload(data: unknown): DashboardPayload | null {
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as DashboardPayload;
    } catch {
      return null;
    }
  }
  return (data as DashboardPayload | null) ?? null;
}

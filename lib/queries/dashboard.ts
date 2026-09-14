import { query } from "@/lib/db";
import { toDateKey, type DateRange } from "@/lib/ranges";

import {
  breakdownFromRows,
  type BreakdownPoint,
  type BreakdownRow,
} from "./breakdown";
import {
  bookingChannelRatesFromRows,
  type BookingChannelRatePoint,
  type BookingChannelRateRow,
} from "./booking-channel-rates";
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
  booking_channel: BreakdownRow[];
  booking_channel_rate: BookingChannelRateRow[];
  customer_type: BreakdownRow[];
  service_location: BreakdownRow[];
  booking_customer_gender: BreakdownRow[];
}

export interface DashboardData {
  kpi: KpiData;
  daily: DailyPoint[];
  heatmap: HeatmapPoint[];
  party_size: PartySizePoint[];
  booking_channel: BreakdownPoint[];
  booking_channel_rate: BookingChannelRatePoint[];
  customer_type: BreakdownPoint[];
  service_location: BreakdownPoint[];
  booking_customer_gender: BreakdownPoint[];
}

// ---- query ----

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
        WHEN BK.status = 'cancelled' THEN 1
        ELSE 0
      END AS is_cancelled
      ,CASE
        WHEN BK.status = 'no_show' THEN 1
        ELSE 0
      END AS is_no_show
      ,CASE
        WHEN BK.status IN ('cancelled', 'no_show') THEN 1
        ELSE 0
      END AS is_cancelled_or_no_show
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
      ,COUNT(*) FILTER (WHERE is_cancelled = 1) AS cancelled_reservations
      ,ROUND(AVG(is_cancelled) * 100, 2) AS cancellation_rate
      ,COUNT(*) FILTER (WHERE is_no_show = 1) AS no_show_reservations
      ,ROUND(AVG(is_no_show) * 100, 2) AS no_show_rate
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
  ,booking_channels AS (
    SELECT
      booking_channel
      ,COUNT(*) AS reservations
    FROM filtered_bookings
    WHERE booking_channel IS NOT NULL
    GROUP BY 1
  )
  ,booking_channel_rates AS (
    SELECT
      booking_channel
      ,ROUND(AVG(is_cancelled_or_no_show) * 100, 2) AS cancel_or_no_show_rate
    FROM filtered_bookings
    WHERE booking_channel IS NOT NULL
      AND TRIM(booking_channel) <> ''
    GROUP BY 1
  )
  ,customer_types AS (
    SELECT
      customer_type
      ,COUNT(*) AS reservations
    FROM filtered_bookings
    WHERE customer_type IS NOT NULL
    GROUP BY 1
  )
  ,service_locations AS (
    SELECT
      service_location_name
      ,COUNT(*) AS reservations
    FROM filtered_bookings
    WHERE service_location_name IS NOT NULL
      AND TRIM(service_location_name) <> ''
    GROUP BY 1
  )
  ,booking_customer_genders AS (
    SELECT
      booking_customer_gender
      ,COUNT(*) AS reservations
    FROM filtered_bookings
    WHERE booking_customer_gender IS NOT NULL
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
      ,'booking_channel'
      ,(SELECT json_agg(booking_channels ORDER BY reservations DESC) FROM booking_channels)
      ,'booking_channel_rate'
      ,(SELECT json_agg(booking_channel_rates ORDER BY booking_channel) FROM booking_channel_rates)
      ,'customer_type'
      ,(SELECT json_agg(customer_types ORDER BY reservations DESC) FROM customer_types)
      ,'service_location'
      ,(SELECT json_agg(service_locations ORDER BY reservations DESC, service_location_name) FROM service_locations)
      ,'booking_customer_gender'
      ,(SELECT json_agg(booking_customer_genders ORDER BY reservations DESC) FROM booking_customer_genders)
    ) AS data
`;

// ---- public api ----

/**
 * Fetches all dashboard sections (KPI summary, daily trend, heatmap, party
 * size distribution, booking-channel status rates, and the booking channel /
 * customer type / gender breakdowns) in a single query and returns them as
 * typed data. Missing sections are returned as empty/zeroed fallbacks.
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
    booking_channel: breakdownFromRows(
      payload?.booking_channel ?? [],
      "booking_channel"
    ),
    booking_channel_rate: bookingChannelRatesFromRows(
      payload?.booking_channel_rate ?? []
    ),
    customer_type: breakdownFromRows(payload?.customer_type ?? [], "customer_type"),
    service_location: breakdownFromRows(
      payload?.service_location ?? [],
      "service_location_name"
    ),
    booking_customer_gender: breakdownFromRows(
      payload?.booking_customer_gender ?? [],
      "booking_customer_gender"
    ),
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

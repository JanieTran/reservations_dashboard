import { query } from "@/lib/db";
import { toDateKey, type DateRange } from "@/lib/ranges";

import {
  bookingChannelRatesFromRows,
  breakdownFromRows,
  dailyFromRows,
  heatmapFromRows,
  kpisFromRows,
  partySizeFromRows,
} from "./dashboard-parsers";
import type { DashboardData, DashboardPayload } from "./dashboard-types";

export type { DashboardData } from "./dashboard-types";

// ---- query ----

const DASHBOARD_SQL = `
  WITH location_tables AS (
    SELECT 
      SL.id AS service_location_id
      ,COUNT(*) AS total_tables
      ,COUNT(*) * 13.5 AS daily_table_hours  -- 10.30AM to 12AM
    FROM public.tables AS TB
    LEFT JOIN public.service_locations AS SL ON TB.service_location_id = SL.id
    WHERE TB.status = 'active'
    GROUP BY 1
  )
  ,booking_tables_count AS (
    SELECT
      BT.booking_id
      ,COUNT(*) AS number_of_tables
    FROM public.booking_tables AS BT
    INNER JOIN public.bookings AS BK ON BT.booking_id = BK.id
    WHERE
      BK.is_test = FALSE
      AND DATE(BK.reserved_at + INTERVAL '7 hours') BETWEEN $3 AND $2
    GROUP BY 1
  )
  ,filtered_bookings AS (
    SELECT
      BK.status
      ,BK.number_of_people
      ,BK.inserted_at + INTERVAL '7 hours' AS inserted_at
      ,BK.reserved_at + INTERVAL '7 hours' AS reserved_at
      ,BK.completed_at + INTERVAL '7 hours' AS completed_at
      ,COALESCE(INITCAP(REPLACE(BK.dine_in_type, '_', ' ')), 'Booking') AS dine_in_type
      ,INITCAP(REPLACE(BK.event_type, '_', ' ')) AS event_type
      ,INITCAP(REPLACE(BK.banquet_type, '_', ' ')) AS banquet_type
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
        ELSE '[8] - More than 1 year'
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
        WHEN LOWER(SPLIT_PART(BK.guest_fullname, ' ', 1)) IN ('anh', 'mr', 'mr.', 'a') THEN 'Male'
        WHEN LOWER(SPLIT_PART(BK.guest_fullname, ' ', 1)) IN ('chi', 'chị', 'ms', 'ms.', 'c') THEN 'Female'
        ELSE NULL
      END AS booking_customer_gender
      ,LT.daily_table_hours
      ,COALESCE(BT.number_of_tables, CEIL(number_of_people / 4.0)) AS number_of_tables
      ,CASE
        WHEN BK.completed_at < BK.reserved_at THEN 2
        ELSE EXTRACT(EPOCH FROM BK.completed_at - BK.reserved_at) / 3600.0
      END AS occupied_hours
      ,CASE
        WHEN BK.completed_at < BK.reserved_at THEN 2 * COALESCE(BT.number_of_tables, CEIL(number_of_people / 4.0))
        ELSE EXTRACT(EPOCH FROM BK.completed_at - BK.reserved_at) / 3600.0
              * COALESCE(BT.number_of_tables, CEIL(number_of_people / 4.0))
      END AS occupied_table_hours
      ,RR.total_amount - RR.total_tax_amount AS revenue
      ,CASE
        WHEN BK.guest_fullname ~* '[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵđ]' THEN 'Vietnamese'
        WHEN LOWER(SPLIT_PART(BK.guest_fullname, ' ', 1)) IN ('anh', 'chị', 'chị', 'a', 'c') THEN 'Vietnamese'
        WHEN LENGTH(BK.guest_fullname) > 2 THEN 'Foreigner'
        ELSE NULL
      END AS guest_nationality
      -- Roughly infer KOLs if name contains 'tiktoker'
      ,CASE
        WHEN BK.guest_fullname ~* 'tiktoker' THEN 1
        ELSE 0
      END AS is_kol
      ,CASE
        WHEN BK.guest_fullname !~* 'tiktoker' THEN 1
        ELSE 0
      END AS is_not_kol
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
    LEFT JOIN location_tables AS LT ON BK.service_location_id = LT.service_location_id
    LEFT JOIN booking_tables_count AS BT ON BK.id = BT.booking_id
    LEFT JOIN public.restaurant_reports AS RR ON BK.id = RR.booking_id
    WHERE
      BK.is_test = FALSE
      AND DATE(BK.reserved_at + INTERVAL '7 hours') BETWEEN $3 AND $2
  )
  ,daily AS (
    SELECT
      period
      ,DATE(reserved_at) AS date
      ,COUNT(*) AS reservations
      ,SUM(number_of_people) AS guests
    FROM filtered_bookings
    GROUP BY 1,2
  )
  ,heatmap AS (
    SELECT
      EXTRACT(ISODOW FROM reserved_at) AS weekday
      ,TO_CHAR(reserved_at, 'Day')      AS weekday_char
      ,EXTRACT(HOUR FROM reserved_at)   AS hour
      ,COUNT(*)                         AS reservations
    FROM filtered_bookings
    WHERE period = 'current'
    GROUP BY 1, 2, 3
  )
  ,kpi AS (
    SELECT
      period
      ,COUNT(*) AS total_bookings
      ,COALESCE(SUM(number_of_people), 0) AS total_guests
      ,ROUND(AVG(number_of_people), 2) AS average_guests
      ,COUNT(*) FILTER (WHERE dine_in_type = 'Booking') AS total_reservations
      ,ROUND(COUNT(*) FILTER (WHERE dine_in_type = 'Booking')::NUMERIC
        / NULLIF(COUNT(*), 0) * 100, 2) AS reservation_rate
      ,COUNT(*) FILTER (WHERE is_cancelled_or_no_show = 1) AS cancelled_reservations
      ,ROUND(AVG(is_cancelled_or_no_show) * 100, 2) AS cancellation_rate
    FROM filtered_bookings
    GROUP BY 1
  )
  ,party_size AS (
    SELECT
      COALESCE(banquet_type, 'Dine In') AS banquet_type
      ,ROUND(AVG(number_of_people), 2) AS average_party_size
    FROM filtered_bookings
    WHERE period = 'current'
      AND dine_in_type = 'Booking'
    GROUP BY 1
  )
  ,booking_channels AS (
    SELECT
      booking_channel
      ,COUNT(*) AS reservations
    FROM filtered_bookings
    WHERE booking_channel IS NOT NULL
      AND period = 'current'
      AND dine_in_type = 'Booking'
    GROUP BY 1
  )
  ,banquet_type_dist AS (
    SELECT
      banquet_type
      ,COUNT(*) AS reservations
    FROM filtered_bookings
    WHERE period = 'current'
      AND dine_in_type = 'Booking'
      AND banquet_type IS NOT NULL
    GROUP BY 1
  )
  ,resv_day_of_week AS (
    SELECT
      weekday
      ,LEFT(TO_CHAR(reserved_at, 'Day'), 3) AS weekday_label
      ,COUNT(*) AS reservations
    FROM filtered_bookings
    WHERE period = 'current'
      AND dine_in_type = 'Booking'
    GROUP BY 1, 2
  )
  ,resv_lead_time AS (
    SELECT
      SUBSTR(lead_time, 2, 1) AS lead_time_idx
      ,SUBSTR(lead_time, 5) AS lead_time_label
      ,COUNT(*) AS reservations
    FROM filtered_bookings
    WHERE period = 'current'
      AND dine_in_type = 'Booking'
    GROUP BY 1, 2
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
      ,(SELECT json_agg(party_size ORDER BY average_party_size) FROM party_size)
      ,'booking_channel'
      ,(SELECT json_agg(booking_channels ORDER BY reservations DESC) FROM booking_channels)
      ,'banquet_type'
      ,(SELECT json_agg(banquet_type_dist ORDER BY reservations DESC) FROM banquet_type_dist)
      ,'resv_day_of_week'
      ,(SELECT json_agg(resv_day_of_week ORDER BY weekday) FROM resv_day_of_week)
      ,'resv_lead_time'
      ,(SELECT json_agg(resv_lead_time ORDER BY lead_time_idx) FROM resv_lead_time)
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
    banquet_type: breakdownFromRows(payload?.banquet_type ?? [], "banquet_type"),
    resv_day_of_week: breakdownFromRows(
      payload?.resv_day_of_week ?? [],
      "weekday_label"
    ),
    resv_lead_time: breakdownFromRows(
      payload?.resv_lead_time ?? [],
      "lead_time_label"
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

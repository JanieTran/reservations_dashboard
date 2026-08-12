import { buildDelta, type Delta, type DeltaKind } from "@/lib/delta";
import { formatCount, formatDecimal, formatPercent } from "@/lib/format";
import type { DateRange } from "@/lib/ranges";

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

export async function getKpiData(_range: DateRange): Promise<KpiData> {
  void _range;
  // TODO: replace with the real single-query aggregation (GROUP BY period)
  // once the reservations schema is known. The query takes the four range
  // params and returns two rows mapped to { current, previous }.
  return SAMPLE_KPI_DATA;
}

export interface KpiItem {
  label: string;
  value: string;
  delta: Delta;
}

type KpiMetricKey = Exclude<keyof KpiPeriod, "period">;

export function getKpiItems(data: KpiData): KpiItem[] {
  const { current, previous } = data;

  const config: Array<{
    label: string;
    key: KpiMetricKey;
    format: (value: number) => string;
    deltaKind: DeltaKind;
    goodWhenUp: boolean;
  }> = [
    {
      label: "Reservations",
      key: "total_reservations",
      format: formatCount,
      deltaKind: "percent",
      goodWhenUp: true,
    },
    {
      label: "Guests",
      key: "total_guests",
      format: formatCount,
      deltaKind: "percent",
      goodWhenUp: true,
    },
    {
      label: "Avg Party Size",
      key: "average_guests",
      format: formatDecimal,
      deltaKind: "percent",
      goodWhenUp: true,
    },
    {
      label: "Cancellation Rate",
      key: "cancellation_rate",
      format: formatPercent,
      deltaKind: "points",
      goodWhenUp: false,
    },
    {
      label: "No-show Rate",
      key: "no_show_rate",
      format: formatPercent,
      deltaKind: "points",
      goodWhenUp: false,
    },
  ];

  return config.map(({ label, key, format, deltaKind, goodWhenUp }) => ({
    label,
    value: format(current[key]),
    delta: buildDelta(current[key], previous[key], deltaKind, goodWhenUp),
  }));
}

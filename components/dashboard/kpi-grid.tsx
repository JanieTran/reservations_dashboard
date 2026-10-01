import { buildDelta, type Delta, type DeltaKind } from "@/lib/delta";
import { formatCount, formatPercent } from "@/lib/format";
import type { KpiData, KpiPeriod } from "@/lib/queries/dashboard-types";

import KpiCard from "@/components/charts/kpi-card";

// ---- types ----

export interface KpiItem {
  label: string;
  value: string;
  delta: Delta;
}

type KpiMetricKey = Exclude<keyof KpiPeriod, "period">;

// ---- config ----

const KPI_CONFIG: Array<{
  label: string;
  key: KpiMetricKey;
  format: (value: number) => string;
  deltaKind: DeltaKind;
  goodWhenUp: boolean;
}> = [
  {
    label: "Total Bookings",
    key: "total_bookings",
    format: formatCount,
    deltaKind: "percent",
    goodWhenUp: true,
  },
  {
    label: "Reservation Rate",
    key: "reservation_rate",
    format: formatPercent,
    deltaKind: "points",
    goodWhenUp: true,
  },
  {
    label: "Total Guests",
    key: "total_guests",
    format: formatCount,
    deltaKind: "percent",
    goodWhenUp: true,
  },
  {
    label: "Cancellation / No-show Rate",
    key: "cancellation_rate",
    format: formatPercent,
    deltaKind: "points",
    goodWhenUp: false,
  },
];

// ---- items ----

export function getKpiItems(data: KpiData): KpiItem[] {
  const { current, previous } = data;

  return KPI_CONFIG.map(({ label, key, format, deltaKind, goodWhenUp }) => ({
    label,
    value: format(current[key]),
    delta: buildDelta(current[key], previous[key], deltaKind, goodWhenUp),
  }));
}

// ---- component ----

interface KpiGridProps {
  data: KpiData;
}

export default function KpiGrid({ data }: KpiGridProps) {
  const items = getKpiItems(data);

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </section>
  );
}

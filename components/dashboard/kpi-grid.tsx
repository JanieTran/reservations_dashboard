import { buildDelta, type Delta, type DeltaKind } from "@/lib/delta";
import { formatCount, formatDecimal, formatPercent } from "@/lib/format";
import type { KpiData, KpiPeriod } from "@/lib/queries/kpis";

import KpiCard from "./kpi-card";

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
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </section>
  );
}

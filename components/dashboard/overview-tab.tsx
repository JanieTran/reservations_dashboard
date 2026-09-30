import HeatmapCard, {
  type HeatmapColumn,
  type HeatmapRow as HeatmapGridRow,
} from "@/components/dashboard/heatmap-card";
import DailyTrend from "@/components/dashboard/daily-trend";
import DonutChart from "@/components/dashboard/donut-chart";
import KpiGrid from "@/components/dashboard/kpi-grid";
import type { DashboardData } from "@/lib/queries/dashboard";
import type {
  HeatmapPoint,
  TableUtilisationHeatmapData,
} from "@/lib/queries/dashboard-types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dayLabel(weekday: number): string {
  return DAYS[weekday - 1] ?? String(weekday);
}

function bookingHeatmapRows(data: HeatmapPoint[]) {
  const counts = new Map<string, number>();
  let scaleMax = 0;
  let minHour = 24;
  let maxHour = 0;

  for (const point of data) {
    counts.set(`${point.weekday}:${point.hour}`, point.reservations);
    scaleMax = Math.max(scaleMax, point.reservations);
    minHour = Math.min(minHour, point.hour);
    maxHour = Math.max(maxHour, point.hour);
  }

  const columns: HeatmapColumn[] = DAYS.map((day, index) => ({
    key: String(index + 1),
    label: day,
  }));
  const rows: HeatmapGridRow[] = [];

  for (let hour = minHour; hour <= maxHour; hour++) {
    rows.push({
      key: String(hour),
      label: String(hour),
      cells: DAYS.map((_, index) => {
        const weekday = index + 1;
        const value = counts.get(`${weekday}:${hour}`) ?? 0;
        const day = dayLabel(weekday);
        const time = `${String(hour).padStart(2, "0")}:00`;

        return {
          value,
          title: `${day} ${time} · ${value} ${value === 1 ? "booking" : "bookings"}`,
          ariaLabel: `${day} ${hour}:00, ${value} ${value === 1 ? "booking" : "bookings"}`,
        };
      }),
    });
  }

  return { columns, rows, scaleMax };
}

function tableUtilisationHeatmapRows(data: TableUtilisationHeatmapData) {
  const columns: HeatmapColumn[] = data.dates.map((date) => ({
    key: date,
    label: date.slice(5).replace("-", "/"),
    title: date,
  }));
  const rows: HeatmapGridRow[] = data.locations.map((location) => ({
    key: location.service_location_name,
    label: location.service_location_name,
    cells: location.utilisation_rates.map((value, index) => {
      const date = data.dates[index];

      return {
        value,
        title: `${location.service_location_name} · ${date}: ${value.toFixed(1)}% utilisation`,
        ariaLabel: `${location.service_location_name}, ${date}: ${value.toFixed(1)}% utilisation`,
      };
    }),
  }));

  return { columns, rows };
}

interface OverviewTabProps {
  data: DashboardData;
}

export default function OverviewTab({ data }: OverviewTabProps) {
  const bookingHeatmap = bookingHeatmapRows(data.heatmap);
  const tableUtilisationHeatmap = tableUtilisationHeatmapRows(
    data.table_utilisation_heatmap
  );

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <KpiGrid data={data.kpi} />
      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <DailyTrend data={data.daily} />
        <HeatmapCard
          title="Booking Heatmap"
          description="Hour × Day of Week"
          rows={bookingHeatmap.rows}
          columns={bookingHeatmap.columns}
          scaleMax={bookingHeatmap.scaleMax}
          legendLow="Low"
          legendHigh="High"
          rowHeaderWidth="2.5rem"
          columnWidth="minmax(0, 1fr)"
          rowLabelAlign="end"
          className="lg:row-span-2"
        />
        <DonutChart
          title="Service Location"
          description="Bookings by service location"
          data={data.service_location}
        />
        <HeatmapCard
          title="Table Utilisation Heatmap"
          description="Daily table capacity used by location"
          rows={tableUtilisationHeatmap.rows}
          columns={tableUtilisationHeatmap.columns}
          scaleMax={50}
          legendLow="0%"
          legendHigh="50%+"
          rowHeaderWidth="9rem"
          columnWidth="2.75rem"
          scrollable
        />
      </section>
    </div>
  );
}

import BookingHeatmap from "@/components/dashboard/booking-heatmap";
import DailyTrend from "@/components/dashboard/daily-trend";
import DonutChart from "@/components/dashboard/donut-chart";
import KpiGrid from "@/components/dashboard/kpi-grid";
import type { DashboardData } from "@/lib/queries/dashboard";

interface OverviewTabProps {
  data: DashboardData;
}

export default function OverviewTab({ data }: OverviewTabProps) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <KpiGrid data={data.kpi} />
      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <DailyTrend data={data.daily} />
        <BookingHeatmap
          data={data.heatmap}
          className="lg:row-span-2"
        />
        <DonutChart
          title="Service Location"
          data={data.service_location}
        />
      </section>
    </div>
  );
}

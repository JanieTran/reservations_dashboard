import BarChartCard from "@/components/dashboard/bar-chart-card";
import type { DashboardData } from "@/lib/queries/dashboard";

interface CancellationTabProps {
  data: DashboardData;
}

export default function CancellationTab({ data }: CancellationTabProps) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2">
      <BarChartCard
        title="By Channels"
        description="Cancellation + no-show rate by booking sources"
        data={data.cancel_by_channel}
        xKey="label"
        valueKey="cancel_rate"
        barName="Cancellation rate"
        valueFormat="percent"
        tooltipLabel="Cancellation rate"
      />
      <BarChartCard
        title="By Locations"
        description="Cancellation + no-show rate by service locations"
        data={data.cancel_by_location}
        xKey="label"
        valueKey="cancel_rate"
        barName="Cancellation rate"
        valueFormat="percent"
        tooltipLabel="Cancellation rate"
        layout="horizontal"
      />
    </section>
  );
}

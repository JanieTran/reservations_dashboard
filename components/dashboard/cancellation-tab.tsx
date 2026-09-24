import BarChartCard from "@/components/dashboard/bar-chart-card";
import type { DashboardData } from "@/lib/queries/dashboard";

interface CancellationTabProps {
  data: DashboardData;
}

export default function CancellationTab({ data }: CancellationTabProps) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-1">
      <BarChartCard
        title="Cancellation and No-Show Rate"
        description="Combined rate by booking source"
        data={data.booking_channel_rate}
        xKey="booking_channel"
        valueKey="cancel_or_no_show_rate"
        barName="Cancel / no-show rate"
        yDomain={[0, 100]}
        valueFormat="percent"
        xAngle={-20}
        tooltipLabel="Cancel / no-show rate"
      />
    </section>
  );
}

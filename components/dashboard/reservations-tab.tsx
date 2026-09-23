import BarChartCard from "@/components/dashboard/bar-chart-card";
import DonutChart from "@/components/dashboard/donut-chart";
import type { DashboardData } from "@/lib/queries/dashboard";

interface ReservationsTabProps {
  data: DashboardData;
}

export default function ReservationsTab({ data }: ReservationsTabProps) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2">
      <DonutChart title="Booking Source" data={data.booking_channel} />
      <BarChartCard
        title="Average Party Size"
        description="Average number of guests by banquet type"
        data={data.party_size}
        xKey="banquet_type"
        valueKey="average_party_size"
        barName="Average Party Size"
        barColor="var(--chart-2)"
        maxBarSize={48}
        margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
        showValueLabels
        valueFormat="decimal-one"
        tooltipLabel="Average Party Size"
      />
      <BarChartCard
        title="Cancellation and No-Show Rate"
        description="Combined rate by booking source"
        data={data.booking_channel_rate}
        xKey="booking_channel"
        valueKey="cancel_or_no_show_rate"
        barName="Cancel / no-show rate"
        barColor="var(--chart-3)"
        maxBarSize={56}
        yDomain={[0, 100]}
        valueFormat="percent"
        xAngle={-20}
        xHeight={48}
        xTextAnchor="end"
        margin={{ bottom: 24, left: 4, right: 4 }}
        tooltipLabel="Cancel / no-show rate"
      />
    </section>
  );
}

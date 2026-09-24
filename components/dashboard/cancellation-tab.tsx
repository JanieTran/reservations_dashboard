import BarChartCard from "@/components/dashboard/bar-chart-card";
import type { DashboardData } from "@/lib/queries/dashboard";

interface CancellationTabProps {
  data: DashboardData;
}

export default function CancellationTab({ data }: CancellationTabProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
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
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-3">
        <BarChartCard
          title="By Event Type"
          description="Cancellation + no-show rate by event type"
          data={data.cancel_by_event_type}
          xKey="label"
          valueKey="cancel_rate"
          barName="Cancellation rate"
          valueFormat="percent"
          tooltipLabel="Cancellation rate"
        />
        <BarChartCard
          title="By Banquet Type"
          description="Cancellation + no-show rate by banquet type"
          data={data.cancel_by_banquet_type}
          xKey="label"
          valueKey="cancel_rate"
          barName="Cancellation rate"
          valueFormat="percent"
          tooltipLabel="Cancellation rate"
        />
        <BarChartCard
          title="Cancellation Reasons"
          description="Count of cancellation and no-show reasons"
          data={data.cancel_reasons_count}
          xKey="label"
          valueKey="reservations"
          barName="Cancellations"
          tooltipLabel="Cancellations"
          layout="horizontal"
        />
      </section>
    </div>
  );
}

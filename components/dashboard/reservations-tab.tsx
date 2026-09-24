import BarChartCard from "@/components/dashboard/bar-chart-card";
import DonutChart from "@/components/dashboard/donut-chart";
import type { DashboardData } from "@/lib/queries/dashboard";

interface ReservationsTabProps {
  data: DashboardData;
}

export default function ReservationsTab({ data }: ReservationsTabProps) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-3">
      <DonutChart title="Booking Source" data={data.booking_channel} />
      <DonutChart title="Banquet Type" data={data.banquet_type} />
      <BarChartCard
        title="Average Party Size"
        description="Average number of guests by banquet type"
        data={data.party_size}
        xKey="banquet_type"
        valueKey="average_party_size"
        barName="Average Party Size"
        margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
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
        valueFormat="percent"
        xAngle={-20}
        tooltipLabel="Cancel / no-show rate"
      />
      <BarChartCard
        title="Reservations by Day of Week"
        description="Booking volume by weekday"
        data={data.resv_day_of_week}
        xKey="label"
        valueKey="reservations"
        barName="Reservations"
        tooltipLabel="Reservations"
      />
      <BarChartCard
        title="Reservations by Lead Time"
        description="Guests book how far in advance"
        data={data.resv_lead_time}
        xKey="label"
        valueKey="reservations"
        barName="Reservations"
        tooltipLabel="Reservations"
      />
    </section>
  );
}

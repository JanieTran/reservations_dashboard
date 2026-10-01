import BarChartCard from "@/components/charts/bar-chart-card";
import DonutChart from "@/components/charts/donut-chart";
import type { DashboardData } from "@/lib/queries/dashboard";

interface ReservationsTabProps {
  data: DashboardData;
}

export default function ReservationsTab({ data }: ReservationsTabProps) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-3">
      <DonutChart
        title="Reservation Source"
        description="Reservations by booking source"
        data={data.booking_channel}
      />
      <DonutChart
        title="Banquet Type"
        description="Reservations by banquet type"
        data={data.banquet_type}
      />
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

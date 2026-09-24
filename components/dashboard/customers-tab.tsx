import DonutChart from "@/components/dashboard/donut-chart";
import StackedBarCard from "@/components/dashboard/stacked-bar-chart-card";
import type { DashboardData } from "@/lib/queries/dashboard";

interface CustomersTabProps {
  data: DashboardData;
}

export default function CustomersTab({ data }: CustomersTabProps) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2">
      <StackedBarCard
        title="Customer Type"
        description="Share of new vs returning customers by location"
        data={data.customer_type}
        xKey="service_location_name"
        stackKeys={["new_rate", "returning_rate"]}
        stackLabels={{ new_rate: "New", returning_rate: "Returning" }}
        valueMode="percent"
        yDomain={[0, 100]}
        layout="horizontal"
      />
      <DonutChart
        title="Reservation Holder Gender"
        description="Bookings by gender"
        data={data.booking_customer_gender}
      />
    </section>
  );
}

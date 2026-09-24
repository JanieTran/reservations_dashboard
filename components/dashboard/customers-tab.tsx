import DonutChart from "@/components/dashboard/donut-chart";
import type { DashboardData } from "@/lib/queries/dashboard";

interface CustomersTabProps {
  data: DashboardData;
}

export default function CustomersTab({ data }: CustomersTabProps) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2">
      <DonutChart
        title="Customer Type"
        description="Bookings by new vs returning customers"
        data={data.customer_type}
      />
      <DonutChart
        title="Reservation Holder Gender"
        description="Bookings by gender"
        data={data.booking_customer_gender}
      />
    </section>
  );
}

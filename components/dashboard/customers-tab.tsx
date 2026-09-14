import DonutChart from "@/components/dashboard/donut-chart";
import type { DashboardData } from "@/lib/queries/dashboard";

interface CustomersTabProps {
  data: DashboardData;
}

export default function CustomersTab({ data }: CustomersTabProps) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2">
      <DonutChart title="Customer Type" data={data.customer_type} />
      <DonutChart
        title="Reservation Holder Gender"
        data={data.booking_customer_gender}
      />
    </section>
  );
}

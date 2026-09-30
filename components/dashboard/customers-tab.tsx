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
        stackKeys={[ "returning_rate", "new_rate" ]}
        stackLabels={{ returning_rate: "Returning", new_rate: "New" }}
        valueMode="percent"
        yDomain={[0, 100]}
        layout="horizontal"
      />
      <StackedBarCard
        title="Customer Type by Booking Channel"
        description="Share of new vs returning customers by channel"
        data={data.customer_type_by_channel}
        xKey="booking_channel"
        stackKeys={["returning_rate", "new_rate"]}
        stackLabels={{ returning_rate: "Returning", new_rate: "New" }}
        valueMode="percent"
        yDomain={[0, 100]}
        layout="horizontal"
      />
      <StackedBarCard
        title="Guest Nationality by Location"
        description="Share of Vietnamese and foreign guests by location"
        data={data.customer_nationality}
        xKey="service_location_name"
        stackKeys={["vietnamese_rate", "foreigner_rate"]}
        stackLabels={{
          vietnamese_rate: "Vietnamese",
          foreigner_rate: "Foreigner",
        }}
        valueMode="percent"
        yDomain={[0, 100]}
        layout="horizontal"
      />
      <StackedBarCard
        title="Reservation Holder Gender"
        description="Share of female and male reservations by location"
        data={data.booking_customer_gender}
        xKey="service_location_name"
        stackKeys={["female_rate", "male_rate"]}
        stackLabels={{ female_rate: "Female", male_rate: "Male" }}
        valueMode="percent"
        yDomain={[0, 100]}
        layout="horizontal"
      />
    </section>
  );
}

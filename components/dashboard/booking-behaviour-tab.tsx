import DonutChart from "@/components/dashboard/donut-chart";
import PartySize from "@/components/dashboard/party-size";
import type { DashboardData } from "@/lib/queries/dashboard";

interface BookingBehaviourTabProps {
  data: DashboardData;
}

export default function BookingBehaviourTab({ data }: BookingBehaviourTabProps) {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2">
      <DonutChart title="Booking Source" data={data.booking_channel} />
      <PartySize data={data.party_size} />
    </section>
  );
}

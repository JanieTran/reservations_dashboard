import { redirect } from "next/navigation";

import KpiGrid from "@/components/dashboard/kpi-grid";
import DonutChart from "@/components/dashboard/donut-chart";
import PartySize from "@/components/dashboard/party-size";
import ReservationHeatmap from "@/components/dashboard/reservations-heatmap";
import ReservationsTrend from "@/components/dashboard/reservations-trend";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardData, type DashboardData } from "@/lib/queries/dashboard";
import { getDefaultDateRange } from "@/lib/ranges";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  let dashboard: DashboardData | null;
  try {
    dashboard = await getDashboardData(getDefaultDateRange());
  } catch {
    dashboard = null;
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Norra Reservations Dashboard
        </h1>
        <form action="/api/auth/logout" method="post">
          <Button variant="outline" type="submit">
            Log out
          </Button>
        </form>
      </header>
      {dashboard ? (
        <>
          <KpiGrid data={dashboard.kpi} />
          <section className="grid gap-4 lg:grid-cols-2">
            <ReservationsTrend data={dashboard.daily} />
            <ReservationHeatmap
              data={dashboard.heatmap}
              className="lg:row-span-2"
            />
            <PartySize data={dashboard.party_size} />
          </section>
          <section className="grid gap-4 md:grid-cols-3">
            <DonutChart
              title="Booking Source"
              data={dashboard.booking_channel}
            />
            <DonutChart
              title="Customer Type"
              data={dashboard.customer_type}
            />
            <DonutChart
              title="Reservation Holder Gender"
              data={dashboard.booking_customer_gender}
            />
          </section>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load dashboard data</CardTitle>
            <CardDescription>
              Could not connect to the database. Check that DATABASE_HOST and
              DATABASE_NAME are set, then try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The KPI summary will appear here once the connection succeeds.
          </CardContent>
        </Card>
      )}
    </main>
  );
}

import { redirect } from "next/navigation";

import KpiGrid from "@/components/dashboard/kpi-grid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getKpiData, type KpiData } from "@/lib/queries/kpis";
import { getDefaultDateRange } from "@/lib/ranges";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  let kpiData: KpiData | null;
  try {
    kpiData = await getKpiData(getDefaultDateRange());
  } catch {
    kpiData = null;
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
      {kpiData ? (
        <KpiGrid data={kpiData} />
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

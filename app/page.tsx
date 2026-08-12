import { redirect } from "next/navigation";

import KpiCard from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { getKpiData, getKpiItems } from "@/lib/queries/kpis";
import { getDefaultDateRange } from "@/lib/ranges";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const kpiItems = getKpiItems(await getKpiData(getDefaultDateRange()));

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
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} {...item} />
        ))}
      </section>
    </main>
  );
}

import { redirect } from "next/navigation";

import CancellationTab from "@/components/dashboard/cancellation-tab";
import CustomersTab from "@/components/dashboard/customers-tab";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { DashboardTab } from "@/components/dashboard/dashboard-sidebar";
import OverviewTab from "@/components/dashboard/overview-tab";
import ReservationsTab from "@/components/dashboard/reservations-tab";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getDashboardData,
  getMerchants,
  type DashboardData,
  type MerchantOption,
} from "@/lib/queries/dashboard";
import {
  getDateRange,
  isDateRangePreset,
  type DateRangePreset,
} from "@/lib/ranges";
import { getSession } from "@/lib/session";

interface DashboardPageProps {
  searchParams: Promise<{ tab?: string; period?: string; merchant_id?: string }>;
}

function isDashboardTab(value: string | undefined): value is DashboardTab {
  return (
    value === "overview" ||
    value === "reservations" ||
    value === "cancellation" ||
    value === "customers"
  );
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const requestedTab = params.tab;
  const activeTab: DashboardTab = isDashboardTab(requestedTab)
    ? requestedTab
    : "overview";
  const period: DateRangePreset = isDateRangePreset(params.period)
    ? params.period
    : "month";
  const dateRange = getDateRange(period);

  let merchants: MerchantOption[] = [];
  let selectedMerchantId: string | null = null;
  let dashboard: DashboardData | null = null;
  try {
    merchants = await getMerchants();
    selectedMerchantId =
      merchants.find((merchant) => merchant.merchant_id === params.merchant_id)
        ?.merchant_id ??
      merchants.find((merchant) => merchant.merchant_name === "Zumstart")
        ?.merchant_id ??
      merchants[0]?.merchant_id ??
      null;

    if (selectedMerchantId) {
      dashboard = await getDashboardData(dateRange, selectedMerchantId);
    }
  } catch {
    dashboard = null;
  }

  return (
    <DashboardShell
      activeTab={activeTab}
      period={period}
      dateRange={dateRange}
      merchants={merchants}
      selectedMerchantId={selectedMerchantId}
    >
      {dashboard ? (
        activeTab === "overview" ? (
          <OverviewTab data={dashboard} />
        ) : activeTab === "reservations" ? (
          <ReservationsTab data={dashboard} />
        ) : activeTab === "cancellation" ? (
          <CancellationTab data={dashboard} />
        ) : (
          <CustomersTab data={dashboard} />
        )
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
    </DashboardShell>
  );
}

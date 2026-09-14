import type { ReactNode } from "react";

import type { DashboardTab } from "@/components/dashboard/dashboard-sidebar";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";

interface DashboardShellProps {
  activeTab: DashboardTab;
  children: ReactNode;
}

const tabLabels: Record<DashboardTab, string> = {
  overview: "Overview",
  "booking-behaviour": "Booking Behaviour",
  customers: "Customers",
};

export default function DashboardShell({
  activeTab,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background lg:flex-row">
      <DashboardSidebar activeTab={activeTab} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center border-b border-border px-5 py-5 sm:px-8">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {tabLabels[activeTab]}
          </h1>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 p-5 sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

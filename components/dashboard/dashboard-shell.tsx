import type { ReactNode } from "react";

import type { DashboardTab } from "@/components/dashboard/dashboard-sidebar";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toDateKey, type DateRange, type DateRangePreset } from "@/lib/ranges";

interface DashboardShellProps {
  activeTab: DashboardTab;
  period: DateRangePreset;
  dateRange: DateRange;
  children: ReactNode;
}

const tabLabels: Record<DashboardTab, string> = {
  overview: "Overview",
  reservations: "Reservations",
  cancellation: "Cancellation",
  customers: "Customers",
};

const periodOptions: { value: DateRangePreset; label: string }[] = [
  { value: "week", label: "Current week" },
  { value: "month", label: "Current month" },
  { value: "quarter", label: "Current quarter" },
  { value: "year", label: "Current year" },
];

function asUtcCalendarDate(date: Date): Date {
  const [year, month, day] = toDateKey(date).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateRange(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return formatter.formatRange(
    asUtcCalendarDate(start),
    asUtcCalendarDate(end)
  );
}

export default function DashboardShell({
  activeTab,
  period,
  dateRange,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background lg:flex-row">
      <DashboardSidebar activeTab={activeTab} period={period} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {tabLabels[activeTab]}
          </h1>
          <div className="flex flex-col gap-1 sm:items-end">
            <form
              action="/"
              method="get"
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="tab" value={activeTab} />
              <span className="text-sm font-medium text-muted-foreground">
                Date range
              </span>
              <Select name="period" defaultValue={period} items={periodOptions}>
                <SelectTrigger
                  id="dashboard-period"
                  aria-label="Date range"
                  className="min-w-40"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" variant="default">
                Apply
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              {formatDateRange(dateRange.currentStart, dateRange.currentEnd)}
              {" · Compared with "}
              {formatDateRange(dateRange.previousStart, dateRange.previousEnd)}
            </p>
          </div>
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

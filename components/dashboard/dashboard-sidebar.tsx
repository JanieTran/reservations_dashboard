"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { CalendarCheck, LayoutDashboard, ShieldAlert, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { DateRangePreset } from "@/lib/ranges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MerchantOption } from "@/lib/queries/dashboard-types";

export type DashboardTab =
  | "overview"
  | "reservations"
  | "cancellation"
  | "customers";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  period: DateRangePreset;
  merchants: MerchantOption[];
  selectedMerchantId: string | null;
}

const navigation: {
  id: DashboardTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  {
    id: "reservations",
    label: "Reservations",
    icon: CalendarCheck,
  },
  {
    id: "cancellation",
    label: "Cancellation",
    icon: ShieldAlert,
  },
  { id: "customers", label: "Customers", icon: Users },
];

export default function DashboardSidebar({
  activeTab,
  period,
  merchants,
  selectedMerchantId,
}: DashboardSidebarProps) {
  const router = useRouter();
  const merchantItems = merchants.map(({ merchant_id, merchant_name }) => ({
    value: merchant_id,
    label: merchant_name,
  }));

  return (
    <Sidebar>
      <SidebarHeader>
        <div>
          <p className="text-sm font-semibold tracking-[0.12em] text-sidebar-primary uppercase">
            Norra
          </p>
          <p className="mt-1 text-xs text-sidebar-foreground/60">
            Restaurant dashboard
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Merchant</SidebarGroupLabel>
          <div className="px-2 pb-2">
            <Select
              value={selectedMerchantId}
              items={merchantItems}
              disabled={merchants.length === 0}
              onValueChange={(value) => {
                if (typeof value !== "string" || value === selectedMerchantId) {
                  return;
                }

                const params = new URLSearchParams({
                  tab: activeTab,
                  period,
                  merchant_id: value,
                });
                router.push(`/?${params.toString()}`, { scroll: false });
              }}
            >
              <SelectTrigger
                aria-label="Merchant"
                className="h-auto w-full bg-background px-5 py-6"
              >
                <SelectValue placeholder="Select merchant" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {merchants.map(({ merchant_id, merchant_name }) => (
                  <SelectItem 
                    key={merchant_id} 
                    value={merchant_id}
                    className="focus:bg-muted focus:text-foreground focus:**:text-foreground"
                  >
                    {merchant_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <SidebarMenu aria-label="Dashboard sections">
            {navigation.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              const params = new URLSearchParams({ tab: id, period });
              if (selectedMerchantId) {
                params.set("merchant_id", selectedMerchantId);
              }

              return (
                <Link
                  key={id}
                  href={`/?${params.toString()}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/75 hover:bg-muted hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarFooter>
          <form action="/api/auth/logout" method="post">
            <Button variant="outline" type="submit" className="w-full">
              Log out
            </Button>
          </form>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

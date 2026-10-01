import Link from "next/link";
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

export type DashboardTab =
  | "overview"
  | "reservations"
  | "cancellation"
  | "customers";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  period: DateRangePreset;
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
}: DashboardSidebarProps) {
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
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu aria-label="Dashboard sections">
            {navigation.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;

              return (
                <Link
                  key={id}
                  href={`/?tab=${id}&period=${period}`}
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

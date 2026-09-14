import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

function Sidebar({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <aside
      data-slot="sidebar"
      className={cn(
        "flex w-full shrink-0 flex-col border-b border-sidebar-border bg-sidebar text-sidebar-foreground lg:h-dvh lg:w-64 lg:overflow-hidden lg:border-r lg:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex items-center px-5 py-5 lg:px-6", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex min-h-0 flex-1 flex-col px-3 pb-4 lg:px-4", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("mt-auto pt-6", className)}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "px-2 pb-1 text-xs font-medium tracking-[0.16em] text-sidebar-foreground/60 uppercase",
        className
      )}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <nav
      data-slot="sidebar-menu"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarFooter,
};

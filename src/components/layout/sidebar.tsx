"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Bell,
  CalendarCheck,
  Settings,
  BriefcaseBusiness,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { label: "Reminders", href: "/dashboard/reminders", icon: Bell },
  { label: "Interviews", href: "/dashboard/interviews", icon: CalendarCheck },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary">
          <BriefcaseBusiness className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-sidebar-accent-foreground">
          {APP_NAME}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-sidebar-primary" : "text-sidebar-muted"
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer hint */}
      <div className="shrink-0 border-t border-sidebar-border px-5 py-3">
        <p className="text-[11px] text-sidebar-muted">
          Track your job search — stay organised.
        </p>
      </div>
    </aside>
  );
}

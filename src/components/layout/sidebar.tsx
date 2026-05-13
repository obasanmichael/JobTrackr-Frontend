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

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { label: "Reminders", href: "/dashboard/reminders", icon: Bell },
  { label: "Interviews", href: "/dashboard/interviews", icon: CalendarCheck },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-[57px] shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary/20">
          <BriefcaseBusiness className="h-[15px] w-[15px] text-sidebar-primary" />
        </div>
        <span className="text-[13px] font-semibold tracking-tight text-white/90">
          JobTrackr
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
          Menu
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-100",
                    active
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-white/90"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[15px] w-[15px] shrink-0 transition-colors",
                      active
                        ? "text-sidebar-primary"
                        : "text-sidebar-muted group-hover:text-sidebar-foreground"
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Separator */}
        <div className="my-3 border-t border-sidebar-border" />

        {/* Settings at bottom of nav */}
        <ul>
          {NAV_ITEMS.slice(4).map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-100",
                    active
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-white/90"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[15px] w-[15px] shrink-0 transition-colors",
                      active
                        ? "text-sidebar-primary"
                        : "text-sidebar-muted group-hover:text-sidebar-foreground"
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-sidebar-border px-5 py-3.5">
        <p className="text-[11px] leading-relaxed text-sidebar-muted">
          Stay organised. Land the role.
        </p>
      </div>
    </aside>
  );
}

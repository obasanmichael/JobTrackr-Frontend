"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Bell,
  CalendarCheck,
  Settings,
  BriefcaseBusiness,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Applications", href: "/dashboard/applications", icon: Briefcase },
  { label: "Reminders", href: "/dashboard/reminders", icon: Bell },
  { label: "Interviews", href: "/dashboard/interviews", icon: CalendarCheck },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Auto-close on navigation
  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const navContent = (
    <aside className="flex h-full w-64 flex-col bg-sidebar lg:w-56">
      {/* Logo */}
      <div className="flex h-[57px] shrink-0 items-center justify-between border-b border-sidebar-border px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary/20">
            <BriefcaseBusiness className="h-[15px] w-[15px] text-sidebar-primary" />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-white/90">JobTrackr</span>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-white transition-colors lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
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
                    "group flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-[13px] font-medium transition-all duration-100 lg:py-2",
                    active
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-white/90"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[15px] w-[15px] shrink-0 transition-colors",
                      active ? "text-sidebar-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground"
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-3 border-t border-sidebar-border" />

        <ul>
          {NAV_ITEMS.slice(4).map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-[13px] font-medium transition-all duration-100 lg:py-2",
                    active
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-white/90"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[15px] w-[15px] shrink-0 transition-colors",
                      active ? "text-sidebar-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground"
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
        <p className="text-[11px] leading-relaxed text-sidebar-muted">Stay organised. Land the role.</p>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop: always visible ────────────────────────────────────── */}
      <div className="hidden h-full shrink-0 lg:block">{navContent}</div>

      {/* ── Mobile: slide-in drawer ────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-full transition-transform duration-200 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </div>
    </>
  );
}

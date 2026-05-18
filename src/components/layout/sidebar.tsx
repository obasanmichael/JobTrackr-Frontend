"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  BriefcaseBusiness,
  LayoutDashboard,
  Briefcase,
  Bell,
  CalendarCheck,
  Search,
  Sparkles,
  FileText,
  Calendar,
  CreditCard,
  Settings,
  X,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: LucideIcon; exact?: boolean };

type NavSection = { title: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Track",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Applications", href: "/dashboard/applications", icon: Briefcase },
      { label: "Reminders", href: "/dashboard/reminders", icon: Bell },
      { label: "Interviews", href: "/dashboard/interviews", icon: CalendarCheck },
    ],
  },
  {
    title: "Discover",
    items: [
      { label: "Jobs", href: "/dashboard/jobs", icon: Search },
      {
        label: "Matched Jobs",
        href: "/dashboard/matches",
        icon: Target,
      },
    ],
  },
  {
    title: "Improve",
    items: [
      { label: "Resume", href: "/dashboard/resume", icon: FileText },
      {
        label: "AI Resume review",
        href: "/dashboard/resume/review",
        icon: Sparkles,
      },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function isActive(href: string, exact = false): boolean {
    if (exact) return pathname === href;
    /* Resume nav should stay active on detail `[id]` but not on `/review` subtree */
    if (href === "/dashboard/resume") {
      return (
        pathname === "/dashboard/resume" ||
        (pathname.startsWith("/dashboard/resume/") &&
          !pathname.startsWith("/dashboard/resume/review"))
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  const navContent = (
    <aside className="flex h-full w-64 flex-col bg-sidebar lg:w-56">
      <div className="flex h-[57px] shrink-0 items-center justify-between border-b border-sidebar-border px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary/20">
            <BriefcaseBusiness className="h-[15px] w-[15px] text-sidebar-primary" />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-white/90">JobTrackr</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-muted transition-colors hover:bg-sidebar-accent/50 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-100 lg:py-1.5",
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
                      <span className="leading-tight">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border px-5 py-3.5">
        <p className="text-[11px] leading-relaxed text-sidebar-muted">
          Discover → track → refine. Your AI workspace for the full search funnel.
        </p>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden h-full shrink-0 lg:block">{navContent}</div>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
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

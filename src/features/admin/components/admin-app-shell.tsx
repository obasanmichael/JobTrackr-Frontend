"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ArrowLeft,
  Database,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { AdminGate } from "@/features/admin/components/admin-gate";
import { Button } from "@/components/ui/button";

const ADMIN_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: Wallet },
  { label: "Job sources", href: "/admin/job-sources", icon: Database },
  { label: "AI usage", href: "/admin/ai-usage", icon: Sparkles },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const nav = (
    <aside className="flex h-full w-64 flex-col border-r border-amber-500/20 bg-card">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Admin console
          </p>
          <p className="text-sm font-semibold text-foreground">JobTrackr</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent lg:hidden"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_LINKS.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-amber-500/15 text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-border p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to app
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden h-full shrink-0 lg:block">{nav}</div>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-full max-w-full transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {nav}
      </div>
    </>
  );
}

function AdminHeader({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenu}
          aria-label="Open admin menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-amber-600" aria-hidden />
          <span className="hidden sm:inline">Internal tools</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => logout()}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-semibold text-amber-900 dark:text-amber-100"
          aria-hidden
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AdminGate>
      <div className="flex h-screen overflow-hidden bg-background">
        <AdminSidebar open={open} onClose={() => setOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminHeader onMenu={() => setOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</div>
          </main>
        </div>
      </div>
    </AdminGate>
  );
}

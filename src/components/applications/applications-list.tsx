"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Briefcase,
  ExternalLink,
  MapPin,
  Calendar,
  ChevronRight,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUSES } from "@/lib/constants";
import type { Application } from "@/types";

const ALL = "All";
const STATUS_FILTERS = [ALL, ...APPLICATION_STATUSES] as const;

function CompanyAvatar({ company }: { company: string }) {
  const initials = company
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const colors = [
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  ];
  const colorIndex = company.charCodeAt(0) % colors.length;
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
        colors[colorIndex]
      )}
    >
      {initials}
    </div>
  );
}

function WorkModePill({ mode }: { mode?: string }) {
  if (!mode || mode === "Unspecified") return null;
  return (
    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
      {mode}
    </span>
  );
}

export function ApplicationsList() {
  const { applications } = useApplicationStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !search ||
        app.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        app.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === ALL || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => {
      counts[a.status] = (counts[a.status] ?? 0) + 1;
    });
    return counts;
  }, [applications]);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Applications</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/applications/new">
            <Plus className="h-3.5 w-3.5" />
            Add application
          </Link>
        </Button>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status filter pills — scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
          {STATUS_FILTERS.map((s) => {
            const active = statusFilter === s;
            const count = s === ALL ? applications.length : (statusCounts[s] ?? 0);
            if (s !== ALL && count === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                )}
              >
                {s}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    active
                      ? "bg-background/20 text-background"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={search || statusFilter !== ALL ? "No matching applications" : "No applications yet"}
          description={
            search || statusFilter !== ALL
              ? "Try adjusting your search or filter."
              : "Add your first job application to start tracking your search."
          }
          action={
            !search && statusFilter === ALL ? (
              <Button size="sm" asChild>
                <Link href="/dashboard/applications/new">
                  <Plus className="h-3.5 w-3.5" /> Add application
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table header */}
          <div className="hidden grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 border-b border-border bg-muted/40 px-4 py-2.5 sm:grid">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Role
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Location
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Updated
            </span>
            <span />
          </div>

          {/* Rows */}
          <ul className="divide-y divide-border">
            {filtered.map((app) => (
              <ApplicationRow key={app.id} app={app} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ApplicationRow({ app }: { app: Application }) {
  return (
    <li>
      <Link
        href={`/dashboard/applications/${app.id}`}
        className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
      >
        <CompanyAvatar company={app.company} />

        {/* Role info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-semibold text-foreground">
              {app.jobTitle}
            </span>
            {app.jobUrl && (
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{app.company}</span>
            {app.workMode && app.workMode !== "Unspecified" && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <WorkModePill mode={app.workMode} />
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="hidden w-36 sm:block">
          <StatusBadge status={app.status} />
        </div>

        {/* Location */}
        <div className="hidden w-32 sm:flex items-center gap-1.5">
          {app.location && (
            <>
              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="truncate text-xs text-muted-foreground">{app.location}</span>
            </>
          )}
        </div>

        {/* Updated */}
        <div className="hidden w-24 sm:block">
          <span className="text-xs text-muted-foreground">
            {format(parseISO(app.updatedAt), "MMM d")}
          </span>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      </Link>
    </li>
  );
}

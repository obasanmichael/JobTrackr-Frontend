"use client";

import Link from "next/link";
import {
  Briefcase,
  TrendingUp,
  Trophy,
  XCircle,
  Bell,
  CalendarCheck,
  ArrowRight,
  Activity,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import type { DashboardSummary } from "@/types";

/* ─── Stat Card ─────────────────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  href?: string;
  trend?: string;
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, href, trend }: StatCardProps) {
  const inner = (
    <Card className={cn("transition-shadow duration-150", href && "hover:shadow-md cursor-pointer")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
              {value}
            </p>
            {trend && (
              <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
            )}
          </div>
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconBg)}>
            <Icon className={cn("h-[18px] w-[18px]", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

/* ─── Due date label ─────────────────────────────────────────────────────── */

function dueDateLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d");
}

/* ─── Loading skeleton ───────────────────────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}><CardContent className="p-5 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-12" />
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */

interface DashboardOverviewProps {
  summary?: DashboardSummary;
  isLoading?: boolean;
}

export function DashboardOverview({ summary, isLoading }: DashboardOverviewProps) {
  if (isLoading) return <DashboardSkeleton />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const isEmpty = !summary?.totalApplications;

  return (
    <div className="space-y-6">
      {/* Title row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{greeting}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s a summary of your job search progress.
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/applications/new">
            <Plus className="h-3.5 w-3.5" />
            Add application
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={summary?.totalApplications ?? 0}
          icon={Briefcase}
          iconBg="bg-primary/10 dark:bg-primary/20"
          iconColor="text-primary"
          href="/dashboard/applications"
        />
        <StatCard
          label="Active"
          value={summary?.activeApplications ?? 0}
          icon={TrendingUp}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Offers"
          value={summary?.offerCount ?? 0}
          icon={Trophy}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Rejected"
          value={summary?.rejectionCount ?? 0}
          icon={XCircle}
          iconBg="bg-red-50 dark:bg-red-500/10"
          iconColor="text-red-500 dark:text-red-400"
        />
      </div>

      {isEmpty ? (
        /* ── Empty state CTA ── */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-foreground">Start tracking your search</h3>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
              Add your first application and JobTrackr will help you stay on top of every opportunity.
            </p>
            <Button className="mt-5" asChild>
              <Link href="/dashboard/applications/new">
                <Plus className="h-4 w-4" />
                Add first application
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ── Populated dashboard ── */
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Status breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[13px]">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                By Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              {summary?.byStatus && Object.keys(summary.byStatus).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(summary.byStatus)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between gap-3">
                        <StatusBadge status={status} size="sm" />
                        <div className="flex flex-1 items-center gap-2">
                          <div className="flex-1 overflow-hidden rounded-full bg-muted h-1.5">
                            <div
                              className="h-full rounded-full bg-primary/40"
                              style={{
                                width: `${Math.round((count / (summary.totalApplications || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="w-5 text-right text-xs font-medium tabular-nums text-muted-foreground">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <EmptyState title="No data yet" className="py-4" />
              )}
            </CardContent>
          </Card>

          {/* Upcoming reminders */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[13px]">
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  Reminders
                </CardTitle>
                <Link
                  href="/dashboard/reminders"
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              {summary?.upcomingReminders?.length ? (
                <ul className="space-y-3">
                  {summary.upcomingReminders.slice(0, 5).map((r) => (
                    <li key={r.id} className="flex items-start gap-2.5">
                      <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">{r.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {dueDateLabel(r.dueDate)}
                          {r.application && ` · ${r.application.company}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No upcoming reminders"
                  description="Create reminders for follow-ups and deadlines."
                  className="py-4"
                />
              )}
            </CardContent>
          </Card>

          {/* Upcoming interviews */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[13px]">
                  <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  Interviews
                </CardTitle>
                <Link
                  href="/dashboard/interviews"
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              {summary?.upcomingInterviews?.length ? (
                <ul className="space-y-3">
                  {summary.upcomingInterviews.slice(0, 5).map((iv) => (
                    <li key={iv.id} className="flex items-start gap-2.5">
                      <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {iv.application?.company ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {iv.stage}
                          {iv.scheduledAt && ` · ${format(parseISO(iv.scheduledAt), "MMM d, h:mm a")}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No upcoming interviews"
                  description="Log interview details against your applications."
                  className="py-4"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

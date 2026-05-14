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
  Plus,
  GitCommitHorizontal,
  MessageSquare,
  Phone,
  FileText,
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const StatusChart = dynamic(
  () => import("./status-chart").then((m) => m.StatusChart),
  { ssr: false, loading: () => <div className="h-[160px] animate-shimmer rounded-xl" /> }
);

const ActivityChart = dynamic(
  () => import("./activity-chart").then((m) => m.ActivityChart),
  { ssr: false, loading: () => <div className="h-[140px] animate-shimmer rounded-xl" /> }
);
import { cn } from "@/lib/utils";
import type { DashboardSummary, Application } from "@/types";

/* ─── Stat card ──────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  href,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  href?: string;
  sub?: string;
}) {
  const inner = (
    <Card className={cn("transition-all duration-150", href && "hover:shadow-md hover:-translate-y-px cursor-pointer")}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-foreground leading-none">
              {value}
            </p>
            {sub && <p className="mt-1.5 text-[11px] text-muted-foreground">{sub}</p>}
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

/* ─── Due date helper ────────────────────────────────────────────────────── */

function dueLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return { text: "Today", urgent: true };
  if (isTomorrow(d)) return { text: "Tomorrow", urgent: false };
  return { text: format(d, "MMM d"), urgent: false };
}

/* ─── Event icon helper ──────────────────────────────────────────────────── */

const EVENT_ICONS: Record<string, React.ElementType> = {
  "Status Change": GitCommitHorizontal,
  "Note": MessageSquare,
  "Recruiter Update": Phone,
  "Interview Update": CalendarCheck,
  "General Update": FileText,
};

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-1">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}><CardContent className="p-5 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-14" />
          </CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardContent className="p-5"><Skeleton className="h-40" /></CardContent></Card>
        <Card><CardContent className="p-5"><Skeleton className="h-40" /></CardContent></Card>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */

interface DashboardOverviewProps {
  summary?: DashboardSummary;
  applications?: Application[];
  isLoading?: boolean;
}

export function DashboardOverview({ summary, applications = [], isLoading }: DashboardOverviewProps) {
  if (isLoading) return <DashboardSkeleton />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const isEmpty = !summary?.totalApplications;

  return (
    <div className="space-y-5">
      {/* Title row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{greeting}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s a snapshot of your job search.
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
          sub={`${summary?.activeApplications ?? 0} active`}
        />
        <StatCard
          label="In Progress"
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
        /* ── Empty state ── */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-foreground">Start tracking your search</h3>
            <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
              Add your first application and your dashboard will fill up with insights.
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
        <>
          {/* ── Analytics row ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Status donut chart */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px]">
                    Status breakdown
                  </span>
                  <Link
                    href="/dashboard/applications"
                    className="flex items-center gap-1 text-[11px] font-normal text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {summary?.byStatus ? (
                  <StatusChart byStatus={summary.byStatus} total={summary.totalApplications} />
                ) : (
                  <EmptyState title="No data yet" className="py-6" />
                )}
              </CardContent>
            </Card>

            {/* Activity over time */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-[13px]">Applications added</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ActivityChart applications={applications} />
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Last 8 weeks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Bottom row: reminders + interviews + recent activity ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Upcoming reminders */}
            <Card>
              <CardHeader>
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
              <CardContent className="pt-2">
                {summary?.upcomingReminders?.length ? (
                  <ul className="space-y-3">
                    {summary.upcomingReminders.slice(0, 4).map((r) => {
                      const due = dueLabel(r.dueDate);
                      return (
                        <li key={r.id} className="flex items-start gap-2.5">
                          <span className={cn("mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full", due.urgent ? "bg-red-500" : "bg-amber-500")} />
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium">{r.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {due.text}{r.application && ` · ${r.application.company}`}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <EmptyState title="No upcoming reminders" className="py-4" />
                )}
              </CardContent>
            </Card>

            {/* Upcoming interviews */}
            <Card>
              <CardHeader>
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
              <CardContent className="pt-2">
                {summary?.upcomingInterviews?.length ? (
                  <ul className="space-y-3">
                    {summary.upcomingInterviews.slice(0, 4).map((iv) => (
                      <li key={iv.id} className="flex items-start gap-2.5">
                        <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium">
                            {iv.application?.company ?? "—"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {iv.stage}
                            {iv.scheduledAt && ` · ${format(parseISO(iv.scheduledAt), "MMM d")}`}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState title="No upcoming interviews" className="py-4" />
                )}
              </CardContent>
            </Card>

            {/* Recent activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[13px]">Recent activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {summary?.recentEvents?.length ? (
                  <ul className="space-y-3">
                    {summary.recentEvents.slice(0, 5).map((ev) => {
                      const Icon = EVENT_ICONS[ev.type] ?? FileText;
                      return (
                        <li key={ev.id} className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                            <Icon className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-[12px] text-foreground">{ev.content}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {format(parseISO(ev.createdAt), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <EmptyState title="No recent activity" className="py-4" />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

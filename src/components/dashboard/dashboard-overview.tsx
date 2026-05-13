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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, parseISO, isBefore, addDays } from "date-fns";
import type { DashboardSummary } from "@/types";

/* ─── Stat Card ─────────────────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  iconClassName?: string;
  href?: string;
}

function StatCard({ label, value, icon: Icon, iconClassName, href }: StatCardProps) {
  const content = (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="mt-1.5 text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              iconClassName ?? "bg-primary/10"
            )}
          >
            <Icon
              className={cn("h-5 w-5", iconClassName ? "text-white" : "text-primary")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

/* ─── Skeleton for loading state ────────────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-1 h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

interface DashboardOverviewProps {
  summary?: DashboardSummary;
  isLoading?: boolean;
}

export function DashboardOverview({ summary, isLoading }: DashboardOverviewProps) {
  if (isLoading) return <DashboardSkeleton />;

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{greeting}</h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a summary of your job search.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={summary?.totalApplications ?? 0}
          icon={Briefcase}
          href="/dashboard/applications"
          iconClassName="bg-primary/10"
        />
        <StatCard
          label="Active"
          value={summary?.activeApplications ?? 0}
          icon={TrendingUp}
          iconClassName="bg-blue-50 dark:bg-blue-950"
        />
        <StatCard
          label="Offers"
          value={summary?.offerCount ?? 0}
          icon={Trophy}
          iconClassName="bg-green-50 dark:bg-green-950"
        />
        <StatCard
          label="Rejected"
          value={summary?.rejectionCount ?? 0}
          icon={XCircle}
          iconClassName="bg-red-50 dark:bg-red-950"
        />
      </div>

      {/* Bottom sections */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Status breakdown */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              By Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary?.byStatus && Object.keys(summary.byStatus).length > 0 ? (
              Object.entries(summary.byStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="text-sm font-medium tabular-nums">{count}</span>
                  </div>
                ))
            ) : (
              <EmptyState
                title="No data yet"
                description="Add applications to see the breakdown."
                className="py-6"
              />
            )}
          </CardContent>
        </Card>

        {/* Upcoming reminders */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                Upcoming Reminders
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                <Link href="/dashboard/reminders">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {summary?.upcomingReminders?.length ? (
              <ul className="space-y-2">
                {summary.upcomingReminders.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        isBefore(parseISO(r.dueDate), addDays(now, 1))
                          ? "bg-red-500"
                          : "bg-amber-500"
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(r.dueDate), "MMM d")}
                        {r.application && ` · ${r.application.company}`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No upcoming reminders"
                description="Create reminders for follow-ups."
                className="py-6"
              />
            )}
          </CardContent>
        </Card>

        {/* Upcoming interviews */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                Upcoming Interviews
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                <Link href="/dashboard/interviews">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {summary?.upcomingInterviews?.length ? (
              <ul className="space-y-2">
                {summary.upcomingInterviews.slice(0, 4).map((iv) => (
                  <li key={iv.id} className="flex items-start gap-2.5">
                    <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {iv.application?.company ?? "Unknown company"}
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
                description="Schedule interviews linked to applications."
                className="py-6"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA for empty state */}
      {!summary?.totalApplications && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-7 w-7 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold text-foreground">Start tracking your job search</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add your first application and JobTrackr will help you stay organised and on top of every opportunity.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/applications">
                Add your first application
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

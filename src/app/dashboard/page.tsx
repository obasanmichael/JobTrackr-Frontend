"use client";

import { useEffect, useState } from "react";
import { getDashboardSummary } from "@/features/job-seeker/dashboard/api/dashboard-api";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import type { DashboardSummary } from "@/types";

const EMPTY_SUMMARY: DashboardSummary = {
  totalApplications: 0,
  activeApplications: 0,
  offerCount: 0,
  rejectionCount: 0,
  byStatus: {},
  upcomingReminders: [],
  upcomingInterviews: [],
  recentEvents: [],
};

export default function DashboardPage() {
  const { applications, refreshApplications } = useApplicationStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    void refreshApplications();
  }, [refreshApplications]);

  useEffect(() => {
    let cancelled = false;
    void getDashboardSummary()
      .then((s) => {
        if (!cancelled) setSummary(s);
      })
      .catch(() => {
        if (!cancelled) setSummary(EMPTY_SUMMARY);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DashboardOverview
      summary={summary ?? undefined}
      applications={applications}
      isLoading={!summary}
    />
  );
}

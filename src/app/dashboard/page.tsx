"use client";

import { useEffect, useState } from "react";
import { getDashboardSummary } from "@/features/job-seeker/dashboard/api/dashboard-api";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import type { DashboardSummary } from "@/types";

export default function DashboardPage() {
  const { applications, refreshApplications } = useApplicationStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    void refreshApplications();
  }, [refreshApplications]);

  useEffect(() => {
    let cancelled = false;
    void getDashboardSummary().then((s) => {
      if (!cancelled) setSummary(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!summary) {
    return null;
  }

  return <DashboardOverview summary={summary} applications={applications} />;
}

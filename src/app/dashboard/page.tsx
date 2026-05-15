"use client";

import { useMemo, useEffect } from "react";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import type { DashboardSummary } from "@/types";

export default function DashboardPage() {
  const {
    applications,
    getReminders,
    getInterviews,
    getEvents,
    refreshApplications,
    refreshEvents,
  } = useApplicationStore();

  useEffect(() => {
    void refreshApplications();
  }, [refreshApplications]);

  const applicationIdsKey = useMemo(
    () => applications.map((a) => a.id).sort().join(","),
    [applications]
  );

  useEffect(() => {
    if (!applicationIdsKey) return;
    const ids = applicationIdsKey.split(",");
    void Promise.all(ids.map((id) => refreshEvents(id)));
  }, [applicationIdsKey, refreshEvents]);

  const timelineDigest = applications
    .flatMap((a) => getEvents(a.id))
    .map((e) => `${e.id}:${e.createdAt}`)
    .join("|");

  const summary = useMemo<DashboardSummary>(() => {
    const byStatus: Record<string, number> = {};
    let activeApplications = 0;
    let offerCount = 0;
    let rejectionCount = 0;
    const inactiveStatuses = new Set(["Rejected", "Withdrawn", "Offer", "Saved"]);

    applications.forEach((a) => {
      byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
      if (a.status === "Offer") offerCount++;
      if (a.status === "Rejected") rejectionCount++;
      if (!inactiveStatuses.has(a.status)) activeApplications++;
    });

    const now = new Date();

    const upcomingReminders = getReminders()
      .filter((r) => !r.completed && new Date(r.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);

    const upcomingInterviews = getInterviews()
      .filter((iv) => iv.scheduledAt && new Date(iv.scheduledAt) >= now)
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
      .slice(0, 5);

    const recentEvents = applications
      .flatMap((a) => getEvents(a.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalApplications: applications.length,
      activeApplications,
      offerCount,
      rejectionCount,
      byStatus,
      upcomingReminders,
      upcomingInterviews,
      recentEvents,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- timelineDigest embeds getEvents output; getEvents ref is stable
  }, [applications, timelineDigest, getReminders, getInterviews]);

  return <DashboardOverview summary={summary} applications={applications} />;
}

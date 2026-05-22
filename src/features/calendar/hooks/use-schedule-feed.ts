"use client";

import { useQuery } from "@tanstack/react-query";
import { listApplications } from "@/features/job-seeker/applications/api/applications-api";
import { listInterviews } from "@/features/job-seeker/interviews/api/interviews-api";
import { listReminders } from "@/features/job-seeker/reminders/api/reminders-api";
import { buildScheduleEvents } from "../lib/build-schedule-events";

export function useScheduleFeed() {
  return useQuery({
    queryKey: ["calendar", "schedule-feed"],
    queryFn: async () => {
      const [interviews, reminders, applications] = await Promise.all([
        listInterviews(),
        listReminders(),
        listApplications(),
      ]);

      return buildScheduleEvents({
        interviews,
        reminders,
        applications,
      });
    },
  });
}

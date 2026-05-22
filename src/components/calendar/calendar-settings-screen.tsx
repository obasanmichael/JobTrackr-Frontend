"use client";

import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { GoogleCalendarSyncSection } from "@/components/calendar/google-calendar-sync-section";
import { JobTrackrScheduleCalendar } from "@/components/calendar/jobtrackr-schedule-calendar";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useCalendarStatus } from "@/features/calendar/hooks/use-calendar-status";
import { useBilling } from "@/features/job-seeker/billing/hooks/use-billing";
import { getApiErrorMessage } from "@/shared/lib/api-errors";

export function CalendarSettingsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const statusQuery = useCalendarStatus();
  const billingQuery = useBilling();

  const calendarEntitlement = billingQuery.data?.entitlements.find(
    (entry) => entry.featureKey === "CALENDAR_SYNC",
  );
  const canUseCalendar = calendarEntitlement?.isEnabled ?? true;

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "1") {
      toast.success("Google Calendar connected successfully.");
      void queryClient.invalidateQueries({ queryKey: ["calendar", "status"] });
      router.replace("/dashboard/calendar");
      return;
    }

    if (error) {
      toast.error(decodeURIComponent(error));
      router.replace("/dashboard/calendar");
    }
  }, [queryClient, router, searchParams]);

  if (statusQuery.isLoading || billingQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading calendar…
      </div>
    );
  }

  if (statusQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Calendar"
          description="Plan interviews and reminders — sync to Google when ready."
        />
        <JobTrackrScheduleCalendar />
        <EmptyState
          icon={CalendarIcon}
          title="Could not load Google Calendar status"
          description={getApiErrorMessage(statusQuery.error)}
          action={
            <Button variant="secondary" size="sm" onClick={() => statusQuery.refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const status = statusQuery.data!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="See interviews and reminders at a glance — export to Google Calendar when you connect."
      />

      <JobTrackrScheduleCalendar />

      <GoogleCalendarSyncSection status={status} canUseCalendar={canUseCalendar} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How Google sync works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Connect Google Calendar in the section above.</p>
          <p>2. Interviews you add in JobTrackr appear in the schedule grid automatically.</p>
          <p>
            3. With auto-sync enabled, upcoming interviews push to Google when you create or
            update them — or use manual sync anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

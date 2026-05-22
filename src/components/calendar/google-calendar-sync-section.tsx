"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Unplug,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  disconnectCalendar,
  fetchCalendarConnectUrl,
  patchCalendarSettings,
  syncCalendarInterviews,
} from "@/features/calendar/api/calendar-api";
import type { CalendarStatusApi } from "@/features/calendar/types";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/shared/lib/api-errors";

function formatWhen(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return format(parseISO(value), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return value;
  }
}

export function GoogleCalendarSyncSection({
  status,
  canUseCalendar,
}: {
  status: CalendarStatusApi;
  canUseCalendar: boolean;
}) {
  const queryClient = useQueryClient();
  const lastSyncAt = formatWhen(status.lastSyncAt ?? null);

  const connectMutation = useMutation({
    mutationFn: fetchCalendarConnectUrl,
    onSuccess: (result) => {
      window.location.href = result.authorizationUrl;
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectCalendar,
    onSuccess: (result) => {
      queryClient.setQueryData(["calendar", "status"], result);
      toast.success("Google Calendar disconnected");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const settingsMutation = useMutation({
    mutationFn: patchCalendarSettings,
    onSuccess: (result) => {
      queryClient.setQueryData(["calendar", "status"], result);
      toast.success("Calendar settings updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const syncMutation = useMutation({
    mutationFn: syncCalendarInterviews,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["calendar", "status"] });
      if (result.syncedCount === 0 && result.failedCount === 0) {
        toast.message("No upcoming interviews to sync.");
        return;
      }
      if (result.failedCount === 0) {
        toast.success(
          `Synced ${result.syncedCount} interview${result.syncedCount === 1 ? "" : "s"} to Google Calendar.`,
        );
        return;
      }
      toast.error(
        `Synced ${result.syncedCount}, failed ${result.failedCount}. Check last sync error below.`,
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const isBusy =
    connectMutation.isPending ||
    disconnectMutation.isPending ||
    settingsMutation.isPending ||
    syncMutation.isPending;

  return (
    <>
      {!canUseCalendar ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">Calendar sync is not on your plan</CardTitle>
            <CardDescription>
              Upgrade or switch to a plan that includes calendar sync to connect Google Calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="secondary">
              <Link href="/dashboard/billing">View billing</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Google Calendar
              </CardTitle>
              <CardDescription className="mt-1.5">
                Export upcoming interviews to your primary Google Calendar.
              </CardDescription>
            </div>
            {status.connected ? (
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">Not connected</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {status.connected ? (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">
                {status.providerAccountEmail ?? "Google account connected"}
              </p>
              {lastSyncAt ? (
                <p className="mt-1 text-muted-foreground">Last sync: {lastSyncAt}</p>
              ) : (
                <p className="mt-1 text-muted-foreground">No interviews synced yet.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connect Google Calendar to mirror upcoming interviews on your phone or desktop
              calendar app.
            </p>
          )}

          {status.lastError ? (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{status.lastError}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {!status.connected ? (
              <Button
                type="button"
                disabled={!canUseCalendar || isBusy}
                onClick={() => connectMutation.mutate()}
              >
                {connectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Connect Google Calendar
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  disabled={isBusy}
                  onClick={() => syncMutation.mutate({})}
                >
                  {syncMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Syncing…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Sync upcoming interviews
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => disconnectMutation.mutate()}
                >
                  {disconnectMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Disconnecting…
                    </>
                  ) : (
                    <>
                      <Unplug className="h-4 w-4" />
                      Disconnect
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {status.connected ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sync settings</CardTitle>
            <CardDescription>
              Control which JobTrackr records are pushed to Google Calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Sync interviews</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  When enabled, new and updated upcoming interviews sync to Google
                  Calendar automatically. You can still run a manual sync anytime.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={status.autoSyncInterviews}
                disabled={settingsMutation.isPending}
                onClick={() =>
                  settingsMutation.mutate({
                    autoSyncInterviews: !status.autoSyncInterviews,
                  })
                }
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors disabled:opacity-50",
                  status.autoSyncInterviews ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow transition-transform",
                    status.autoSyncInterviews ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </label>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

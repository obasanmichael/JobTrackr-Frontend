"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  Database,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  listAdminJobSources,
  purgeInactiveExternalJobs,
  runExternalJobQualityScan,
  syncAdminJobSource,
  syncAllActiveAdminJobSources,
} from "@/features/admin/job-sources/api/admin-job-sources-api";
import type { JobSourceAdminApi } from "@/features/admin/job-sources/types";
import { getApiErrorMessage } from "@/shared/lib/api-errors";

function formatWhen(value: string | null): string {
  if (!value) {
    return "—";
  }
  try {
    return format(parseISO(value), "MMM d, yyyy HH:mm");
  } catch {
    return value;
  }
}

function HealthBadge({ source }: { source: JobSourceAdminApi }) {
  if (!source.isActive) {
    return (
      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
        Inactive
      </span>
    );
  }

  if (source.consecutiveSyncFailures >= 3) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
        <ShieldAlert className="h-3 w-3" />
        {source.consecutiveSyncFailures} failures
      </span>
    );
  }

  if (source.lastErrorAt) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-3 w-3" />
        Last sync error
      </span>
    );
  }

  return (
    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
      Healthy
    </span>
  );
}

function SourceRow({
  source,
  onSync,
  syncingId,
}: {
  source: JobSourceAdminApi;
  onSync: (id: string) => void;
  syncingId: string | null;
}) {
  const isSyncing = syncingId === source.id;

  return (
    <tr className="border-b border-border/70 last:border-0">
      <td className="px-3 py-3 align-top">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{source.name}</p>
          <p className="text-xs text-muted-foreground">{source.type}</p>
        </div>
      </td>
      <td className="px-3 py-3 align-top">
        <HealthBadge source={source} />
      </td>
      <td className="px-3 py-3 align-top text-xs text-muted-foreground">
        <div className="space-y-1">
          <p>Last sync: {formatWhen(source.lastSyncAt)}</p>
          <p>Last success: {formatWhen(source.lastSuccessAt)}</p>
          <p>Last error: {formatWhen(source.lastErrorAt)}</p>
        </div>
      </td>
      <td className="px-3 py-3 align-top text-xs text-muted-foreground">
        {source.lastErrorMessage ? (
          <p className="max-w-xs whitespace-pre-wrap break-words">
            {source.lastErrorMessage}
          </p>
        ) : (
          "—"
        )}
      </td>
      <td className="px-3 py-3 align-top">
        <Button
          variant="outline"
          size="sm"
          disabled={isSyncing}
          onClick={() => onSync(source.id)}
        >
          {isSyncing ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
          )}
          Sync
        </Button>
      </td>
    </tr>
  );
}

export function JobSourcesAdminScreen() {
  const queryClient = useQueryClient();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [lastScanSummary, setLastScanSummary] = useState<string | null>(null);
  const [lastPurgeSummary, setLastPurgeSummary] = useState<string | null>(null);

  const sourcesQuery = useQuery({
    queryKey: ["admin", "job-sources"],
    queryFn: listAdminJobSources,
    retry: false,
  });

  const syncOneMutation = useMutation({
    mutationFn: syncAdminJobSource,
    onMutate: (id) => setSyncingId(id),
    onSettled: () => setSyncingId(null),
    onSuccess: (result) => {
      toast.success(
        `Synced ${result.upsertedCount} job(s); ${result.inactivatedCount} inactivated.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["admin", "job-sources"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
      void queryClient.invalidateQueries({ queryKey: ["admin", "job-sources"] });
    },
  });

  const syncAllMutation = useMutation({
    mutationFn: syncAllActiveAdminJobSources,
    onSuccess: (result) => {
      toast.success(
        `Bulk sync finished: ${result.succeeded}/${result.attempted} succeeded.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["admin", "job-sources"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const scanMutation = useMutation({
    mutationFn: runExternalJobQualityScan,
    onSuccess: (result) => {
      setLastScanSummary(
        `Scanned ${result.scannedCount}; flagged ${result.suspiciousCount} suspicious.`,
      );
      toast.success("Quality scan complete");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const purgeMutation = useMutation({
    mutationFn: () => purgeInactiveExternalJobs({ dryRun: true }),
    onSuccess: (result) => {
      setLastPurgeSummary(
        `Dry run: ${result.matchedCount} inactive job(s) older than ${result.retentionDays}d would be purged.`,
      );
      toast.success("Purge dry-run complete");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const sources = useMemo(
    () => sourcesQuery.data ?? [],
    [sourcesQuery.data],
  );

  if (sourcesQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading job sources…
      </div>
    );
  }

  if (sourcesQuery.isError) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admin access required"
        description={getApiErrorMessage(sourcesQuery.error)}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Job sources"
        description="Monitor ATS ingest health, run quality scans, and trigger syncs."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={syncAllMutation.isPending}
              onClick={() => syncAllMutation.mutate()}
            >
              {syncAllMutation.isPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
              )}
              Sync active
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={scanMutation.isPending}
              onClick={() => scanMutation.mutate()}
            >
              {scanMutation.isPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Database className="mr-2 h-3.5 w-3.5" />
              )}
              Quality scan
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={purgeMutation.isPending}
              onClick={() => purgeMutation.mutate()}
            >
              {purgeMutation.isPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Database className="mr-2 h-3.5 w-3.5" />
              )}
              Purge dry-run
            </Button>
          </div>
        }
      />

      {(lastScanSummary || lastPurgeSummary) && (
        <Card className="space-y-1 border-border/80 p-4 text-sm text-muted-foreground">
          {lastScanSummary && <p>{lastScanSummary}</p>}
          {lastPurgeSummary && <p>{lastPurgeSummary}</p>}
        </Card>
      )}

      <Card className="overflow-hidden border-border/80">
        {sources.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Database}
              title="No job sources yet"
              description="Seed or approve careers page submissions to create ingestion sources."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Health</th>
                  <th className="px-3 py-2">Sync times</th>
                  <th className="px-3 py-2">Last error</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <SourceRow
                    key={source.id}
                    source={source}
                    syncingId={syncingId}
                    onSync={(id) => syncOneMutation.mutate(id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

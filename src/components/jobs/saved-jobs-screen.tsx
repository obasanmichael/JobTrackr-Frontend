"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Bookmark,
  BriefcaseBusiness,
  ExternalLink,
  Loader2,
  MapPin,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  convertSavedJob,
  deleteSavedJob,
  listSavedJobs,
  type SavedJobApiRecord,
} from "@/features/job-seeker/jobs/api/saved-jobs-api";
import { savedJobsBookmarksQueryKey } from "@/features/job-seeker/jobs/lib/saved-jobs-hooks-support";
import { getApiErrorMessage } from "@/shared/lib/api-errors";

const savedJobsListQueryKey = ["saved-jobs", "list", "v1"] as const;

export function SavedJobsScreen() {
  const queryClient = useQueryClient();

  const savedQuery = useQuery({
    queryKey: savedJobsListQueryKey,
    queryFn: () => listSavedJobs({ page: 1, limit: 50, includeConverted: true }),
  });

  async function invalidateSavedJobs() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: savedJobsListQueryKey }),
      queryClient.invalidateQueries({ queryKey: savedJobsBookmarksQueryKey() }),
    ]);
  }

  const removeMutation = useMutation({
    mutationFn: (savedJobId: string) => deleteSavedJob(savedJobId),
    onSuccess: async () => {
      toast.success("Removed from saved jobs");
      await invalidateSavedJobs();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const convertMutation = useMutation({
    mutationFn: (savedJobId: string) => convertSavedJob(savedJobId),
    onSuccess: async (result) => {
      toast.success("Added to your applications tracker", {
        description: `${result.application.jobTitle ?? "Application"} created.`,
      });
      await Promise.all([
        invalidateSavedJobs(),
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
      ]);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (savedQuery.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading saved jobs…
      </div>
    );
  }

  if (savedQuery.isError) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Could not load saved jobs"
        description={getApiErrorMessage(savedQuery.error)}
        action={
          <Button variant="secondary" size="sm" onClick={() => savedQuery.refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  const items = savedQuery.data.items;
  const busy = removeMutation.isPending || convertMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved jobs"
        description="Roles you bookmarked from the job board. Convert one to start tracking it as an application."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap Save on any listing in the job board and it will show up here."
          action={
            <Button variant="secondary" size="sm" asChild>
              <Link href="/dashboard/jobs">Browse jobs</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((saved) => (
            <SavedJobCard
              key={saved.id}
              saved={saved}
              busy={busy}
              onRemove={() => removeMutation.mutate(saved.id)}
              onConvert={() => convertMutation.mutate(saved.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SavedJobCard({
  saved,
  busy,
  onRemove,
  onConvert,
}: {
  saved: SavedJobApiRecord;
  busy: boolean;
  onRemove: () => void;
  onConvert: () => void;
}) {
  const { job } = saved;
  const converted = saved.status === "CONVERTED_TO_APPLICATION";
  const savedLabel = format(parseISO(saved.createdAt), "MMM d, yyyy");

  return (
    <Card className="flex flex-col gap-3 border-border/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Link
            href={`/dashboard/jobs/${job.id}`}
            className="line-clamp-2 text-sm font-semibold text-foreground hover:underline"
          >
            {job.title}
          </Link>
          <p className="truncate text-sm text-muted-foreground">{job.companyName}</p>
        </div>
        {converted ? (
          <span className="shrink-0 rounded-full bg-sidebar-primary/15 px-2 py-0.5 text-[11px] font-semibold text-sidebar-primary">
            In tracker
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {job.location ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        ) : null}
        <span>Saved {savedLabel}</span>
      </div>

      {saved.notes ? (
        <p className="line-clamp-2 text-xs text-muted-foreground">{saved.notes}</p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {converted ? (
          saved.convertedApplicationId ? (
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/dashboard/applications/${saved.convertedApplicationId}`}>
                <BriefcaseBusiness className="mr-1.5 h-3.5 w-3.5" />
                View application
              </Link>
            </Button>
          ) : null
        ) : (
          <Button variant="secondary" size="sm" disabled={busy} onClick={onConvert}>
            <BriefcaseBusiness className="mr-1.5 h-3.5 w-3.5" />
            Track application
          </Button>
        )}
        {job.applyUrl ? (
          <Button variant="outline" size="sm" asChild>
            <a href={job.applyUrl} target="_blank" rel="noreferrer">
              Apply
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={onRemove}
          aria-label="Remove saved job"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
    </Card>
  );
}

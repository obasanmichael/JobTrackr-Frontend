"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ExternalLink, Loader2, RefreshCw, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  fetchMatchedJobs,
  generateMatchedJobs,
} from "@/features/job-seeker/jobs/api/jobs-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";

export function MatchedJobsScreen() {
  const queryClient = useQueryClient();

  const matchesQuery = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatchedJobs,
  });

  const generateMutation = useMutation({
    mutationFn: generateMatchedJobs,
    onSuccess: (result) => {
      queryClient.setQueryData(["matches"], result);
      toast.success("Matches refreshed");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  if (matchesQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading matches…
      </div>
    );
  }

  if (matchesQuery.isError) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Could not load matches"
        description={getApiErrorMessage(matchesQuery.error)}
        action={
          <Button variant="secondary" size="sm" onClick={() => matchesQuery.refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  const data = matchesQuery.data;

  if (data?.requiresProfile) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Matched jobs"
          description="AI-ranked roles based on your parsed candidate profile."
        />
        <EmptyState
          icon={Sparkles}
          title="Upload your resume first"
          description="We need a confirmed candidate profile before we can score external listings."
          action={
            <Button variant="secondary" size="sm" asChild>
              <Link href="/dashboard/resume">Go to resume</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matched jobs"
        description="Ranked by fit against your active resume profile."
        action={
          <Button
            variant="outline"
            size="sm"
            disabled={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            {generateMutation.isPending ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
            )}
            Refresh matches
          </Button>
        }
      />

      {!data || data.total === 0 ? (
        <EmptyState
          icon={Target}
          title="No matches yet"
          description="Sync job sources and refresh matches once listings are available."
          action={
            <Button variant="secondary" size="sm" onClick={() => generateMutation.mutate()}>
              Generate matches
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.matches.map((match) => {
            const postedLabel = match.job.postedAt
              ? format(parseISO(match.job.postedAt), "MMM d, yyyy")
              : null;

            return (
              <Card key={match.job.id} className="flex flex-col gap-3 border-border/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Link
                      href={`/dashboard/jobs/${match.job.id}`}
                      className="text-sm font-semibold text-foreground hover:underline"
                    >
                      {match.job.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{match.job.companyName}</p>
                  </div>
                  <span className="rounded-full bg-sidebar-primary/15 px-2.5 py-1 text-xs font-semibold text-sidebar-primary">
                    {match.overallScore}
                  </span>
                </div>
                <p className="line-clamp-3 text-xs text-muted-foreground">{match.matchReason}</p>
                {postedLabel ? (
                  <p className="text-[11px] text-muted-foreground">Posted {postedLabel}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/dashboard/jobs/${match.job.id}`}>View details</Link>
                  </Button>
                  {match.job.applyUrl ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={match.job.applyUrl} target="_blank" rel="noreferrer">
                        Apply
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

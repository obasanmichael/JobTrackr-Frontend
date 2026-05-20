"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createApplication } from "@/features/job-seeker/applications/api/applications-api";
import {
  getJobById,
  getJobMatch,
} from "@/features/job-seeker/jobs/api/jobs-api";
import { jobDetailToCreateApplicationPayload } from "@/features/job-seeker/jobs/lib/job-mappers";
import {
  isJobSaved,
  toggleSavedJobId,
} from "@/features/job-seeker/jobs/lib/saved-jobs-storage";
import { getApiErrorMessage } from "@/shared/lib/api-errors";

function formatLabel(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

interface JobDetailScreenProps {
  jobId: string;
}

export function JobDetailScreen({ jobId }: JobDetailScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(() => isJobSaved(jobId));

  const jobQuery = useQuery({
    queryKey: ["jobs", "detail", jobId],
    queryFn: () => getJobById(jobId),
  });

  const matchQuery = useQuery({
    queryKey: ["jobs", "match", jobId],
    queryFn: () => getJobMatch(jobId),
    enabled: Boolean(jobQuery.data),
    retry: false,
  });

  const trackMutation = useMutation({
    mutationFn: async () => {
      if (!jobQuery.data) {
        throw new Error("Job not loaded");
      }
      return createApplication(jobDetailToCreateApplicationPayload(jobQuery.data));
    },
    onSuccess: (application) => {
      toast.success("Added to your applications");
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
      router.push(`/dashboard/applications/${application.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const salaryLabel = useMemo(() => {
    const job = jobQuery.data;
    if (!job) {
      return null;
    }
    const parts = [job.salaryMin, job.salaryMax]
      .map((n) => (n != null ? n.toLocaleString() : null))
      .filter(Boolean);
    if (parts.length === 0) {
      return null;
    }
    return `${parts.join(" – ")}${job.currency ? ` ${job.currency}` : ""}`;
  }, [jobQuery.data]);

  if (jobQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading job…
      </div>
    );
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <EmptyState
        title="Job not found"
        description={getApiErrorMessage(jobQuery.error)}
        action={
          <Button variant="secondary" size="sm" asChild>
            <Link href="/dashboard/jobs">Back to jobs</Link>
          </Button>
        }
      />
    );
  }

  const job = jobQuery.data;
  const match = matchQuery.data;
  const postedLabel = job.postedAt
    ? format(parseISO(job.postedAt), "MMM d, yyyy")
    : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Jobs
          </Link>
        </Button>
      </div>

      <PageHeader
        title={job.title}
        description={job.companyName}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = toggleSavedJobId(jobId);
                setSaved(next);
                toast.success(next ? "Job saved" : "Removed from saved jobs");
              }}
            >
              {saved ? (
                <BookmarkCheck className="mr-2 h-4 w-4" />
              ) : (
                <Bookmark className="mr-2 h-4 w-4" />
              )}
              {saved ? "Saved" : "Save job"}
            </Button>
            {job.applyUrl ? (
              <Button variant="outline" size="sm" asChild>
                <a href={job.applyUrl} target="_blank" rel="noreferrer">
                  View posting
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            ) : null}
          </div>
        }
      />

      <Card className="space-y-3 border-border/80 p-5">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {job.location ? <span>{job.location}</span> : null}
          {job.workMode ? (
            <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
              {formatLabel(job.workMode)}
            </span>
          ) : null}
          {job.experienceLevel ? (
            <span className="rounded-full border border-border px-2 py-0.5">
              {formatLabel(job.experienceLevel)}
            </span>
          ) : null}
          {job.sourceMeta ? (
            <span className="rounded-full border border-border px-2 py-0.5">
              Source: {job.sourceMeta.name} ({formatLabel(job.sourceMeta.type)})
            </span>
          ) : job.source ? (
            <span className="rounded-full border border-border px-2 py-0.5">
              Source: {job.source}
            </span>
          ) : null}
        </div>
        {salaryLabel ? <p className="text-sm text-muted-foreground">{salaryLabel}</p> : null}
        {postedLabel ? (
          <p className="text-xs text-muted-foreground">Posted {postedLabel}</p>
        ) : null}
      </Card>

      {matchQuery.isLoading ? (
        <Card className="border-border/80 p-5 text-sm text-muted-foreground">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
          Loading match score…
        </Card>
      ) : match?.requiresProfile ? (
        <Card className="space-y-3 border-border/80 p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-sidebar-primary" />
            AI match
          </div>
          <p className="text-sm text-muted-foreground">
            Upload and parse a resume to see how well this role fits your profile.
          </p>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/dashboard/resume">Go to resume</Link>
          </Button>
        </Card>
      ) : match ? (
        <Card className="space-y-3 border-border/80 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-sidebar-primary" />
              Match score
            </div>
            <span className="rounded-full bg-sidebar-primary/15 px-3 py-1 text-sm font-semibold text-sidebar-primary">
              {match.overallScore}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{match.matchReason}</p>
          {match.matchedSkills.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Matched: {match.matchedSkills.join(", ")}
            </p>
          ) : null}
          {match.missingSkills.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Gaps: {match.missingSkills.join(", ")}
            </p>
          ) : null}
        </Card>
      ) : null}

      {job.description ? (
        <Card className="space-y-2 border-border/80 p-5">
          <h3 className="text-sm font-semibold">Description</h3>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.description}</p>
        </Card>
      ) : null}

      {job.requirements ? (
        <Card className="space-y-2 border-border/80 p-5">
          <h3 className="text-sm font-semibold">Requirements</h3>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.requirements}</p>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3 pb-6">
        <Button
          disabled={trackMutation.isPending}
          onClick={() => trackMutation.mutate()}
        >
          {trackMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Track as application
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/applications/new">Open full application form</Link>
        </Button>
      </div>
    </div>
  );
}

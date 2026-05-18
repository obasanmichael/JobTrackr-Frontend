"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { AlertCircle, CheckCircle2, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ResumeUploadZone } from "@/components/resume/resume-upload-zone";
import { ResumeStatusBadge } from "@/components/resume/resume-status-badge";
import {
  listResumes,
  patchResumeActive,
  uploadResumeFile,
} from "@/features/job-seeker/resume/api/resumes-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { cn } from "@/lib/utils";
import type { Resume } from "@/types";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function ResumeRow({ resume, onSetActive }: { resume: Resume; onSetActive: (id: string) => void }) {
  const isParsing = resume.status === "PARSING" || resume.status === "UPLOADED";

  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-border/80">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{resume.fileName}</p>
          <ResumeStatusBadge status={resume.status} />
          {resume.isActive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-800 dark:bg-violet-950/60 dark:text-violet-300">
              <Star className="h-3 w-3 fill-current" />
              Active for matching
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatBytes(resume.fileSize)}
          {" · "}
          Updated {format(parseISO(resume.updatedAt), "MMM d, yyyy")}
        </p>
        {resume.status === "FAILED" && resume.parseError && (
          <p className="text-xs text-red-700 dark:text-red-400">{resume.parseError}</p>
        )}
      </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {isParsing ? (
            <Button variant="outline" size="sm" disabled title="Parsing in progress">
              View profile
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/resume/${resume.id}`}>View profile</Link>
            </Button>
          )}
        <Button
          variant="secondary"
          size="sm"
          disabled={isParsing || resume.isActive}
          onClick={() => onSetActive(resume.id)}
        >
          Use for matching
        </Button>
      </div>
    </Card>
  );
}

export function ResumeOverviewScreen() {
  const queryClient = useQueryClient();

  const {
    data: resumes,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["resumes"],
    queryFn: listResumes,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadResumeFile,
    onSuccess: () => {
      toast.success("Resume uploaded.");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : getApiErrorMessage(e);
      toast.error(msg);
    },
  });

  const activeMutation = useMutation({
    mutationFn: (id: string) => patchResumeActive(id, true),
    onSuccess: () => {
      toast.success("Active resume updated.");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e)),
  });

  const activeResume = resumes?.find((r) => r.isActive);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resume"
        description="Upload and manage resumes, review parsed details, and run AI-guided improvements."
        action={
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/dashboard/resume/review" className="gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              AI resume review
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Active resume</h3>
            <p className="text-sm text-muted-foreground">
              Matching and recommendations prefer the resume marked active.
            </p>
          </div>
          <Card className="border-border/80 bg-card p-5">
            {activeResume ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{activeResume.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      <ResumeStatusBadge status={activeResume.status} className="mr-2 align-middle" />
                      Parsing must finish before edits.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/resume/${activeResume.id}`}>Review profile</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/dashboard/resume/review">Open AI review</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={AlertCircle}
                title="No active resume"
                description='Upload a resume and choose "Use for matching" once parsing completes.'
              />
            )}
          </Card>
        </div>

        <div>
          <ResumeUploadZone
            isUploading={uploadMutation.isPending}
            disabled={uploadMutation.isPending}
            onFileSelected={(file) => uploadMutation.mutate(file)}
          />
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Resume history</h3>
            <p className="text-sm text-muted-foreground">
              Parsing runs on upload. Parsed text powers your candidate profile editor.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            disabled={isPending}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>

        {isPending ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className={cn("h-[88px] rounded-xl bg-muted animate-pulse")} />
            ))}
          </div>
        ) : isError ? (
          <Card className="border-destructive/40 p-6 text-sm text-destructive">
            {getApiErrorMessage(error)}{" "}
            <button type="button" className="underline" onClick={() => refetch()}>
              Retry
            </button>
          </Card>
        ) : !resumes?.length ? (
          <EmptyState title="No resumes yet" description="Upload your first CV to get started." />
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <ResumeRow
                key={resume.id}
                resume={resume}
                onSetActive={(id) => activeMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

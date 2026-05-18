"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ArrowLeft, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeStatusBadge } from "@/components/resume/resume-status-badge";
import { CandidateProfileEditor } from "@/components/resume/candidate-profile-editor";
import {
  getCandidateProfile,
  getResume,
  updateCandidateProfile,
} from "@/features/job-seeker/resume/api/resumes-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { cn } from "@/lib/utils";
import type { ResumeParseStatus, UpdateCandidateProfilePayload } from "@/types";

function canFetchProfile(status: ResumeParseStatus): boolean {
  return status === "PARSED" || status === "FAILED";
}

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeDetailScreen() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const queryClient = useQueryClient();

  const resumeQuery = useQuery({
    queryKey: ["resume", id],
    enabled: !!id,
    queryFn: () => getResume(id),
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "PARSING" || s === "UPLOADED" ? 2000 : false;
    },
  });

  const profileQuery = useQuery({
    queryKey: ["resume-profile", id],
    enabled:
      !!id &&
      !!resumeQuery.data?.status &&
      canFetchProfile(resumeQuery.data.status),
    queryFn: () => getCandidateProfile(id),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: UpdateCandidateProfilePayload) =>
      updateCandidateProfile(id, payload),
    onSuccess: async () => {
      toast.success("Profile saved.");
      await queryClient.invalidateQueries({ queryKey: ["resume-profile", id] });
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e)),
  });

  if (!id) {
    return (
      <p className="text-sm text-muted-foreground">Missing resume identifier.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/dashboard/resume">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to resumes
          </Link>
        </Button>
      </div>

      {resumeQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/5" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : resumeQuery.isError ? (
        <Card className="border-destructive/40 p-6 text-sm text-destructive">
          {getApiErrorMessage(resumeQuery.error)}{" "}
          <button type="button" className="underline" onClick={() => resumeQuery.refetch()}>
            Retry
          </button>
        </Card>
      ) : resumeQuery.data ? (
        <>
          <PageHeader
            title={resumeQuery.data.fileName}
            description={`Uploaded ${format(parseISO(resumeQuery.data.createdAt), "MMM d, yyyy • h:mm a")}`}
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/resume/review">
                  Continue to AI resume review
                </Link>
              </Button>
            }
          />

          <Card className="border-border/80 bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Resume file</span>
                  <ResumeStatusBadge status={resumeQuery.data.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(resumeQuery.data.fileSize)} · {resumeQuery.data.fileType}
                </p>
                {resumeQuery.data.status === "FAILED" && resumeQuery.data.parseError && (
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {resumeQuery.data.parseError}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {(resumeQuery.data.status === "PARSING" || resumeQuery.data.status === "UPLOADED") && (
            <Card className="border-amber-200/80 bg-amber-50/50 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100/90">
              Parsing is still running. This page refreshes automatically every few seconds.
            </Card>
          )}

          {resumeQuery.data.parsedText && resumeQuery.data.status === "PARSED" && (
            <details className="group rounded-lg border border-border/80 bg-muted/20 p-4">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                View extracted text
              </summary>
              <pre
                className={cn(
                  "mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-background p-3 text-xs text-muted-foreground"
                )}
              >
                {resumeQuery.data.parsedText}
              </pre>
            </details>
          )}

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Candidate profile</h3>
              <p className="text-sm text-muted-foreground">
                Edit how JobTrackr should represent you for matching and recommendations.
              </p>
            </div>

            {!canFetchProfile(resumeQuery.data.status) ? (
              <Card className="border-border/80 p-6 text-sm text-muted-foreground">
                The profile editor unlocks after parsing completes.
              </Card>
            ) : profileQuery.isPending ? (
              <Skeleton className="h-[420px] w-full" />
            ) : profileQuery.isError ? (
              <Card className="border-destructive/40 p-6 text-sm text-destructive">
                {getApiErrorMessage(profileQuery.error)}{" "}
                <button type="button" className="underline" onClick={() => profileQuery.refetch()}>
                  Retry
                </button>
              </Card>
            ) : profileQuery.data ? (
              <>
                {(profileQuery.data.headline ?? "").length === 0 && (
                  <Card className="border-amber-200/70 bg-muted/15 p-3 text-xs text-muted-foreground">
                    Profile looks sparse—consider adding headline, roles, and skills so matching has
                    signals to work with.
                  </Card>
                )}
                <CandidateProfileEditor
                  profile={profileQuery.data}
                  disabled={saveMutation.isPending}
                  isSaving={saveMutation.isPending}
                  onSubmit={(payload) =>
                    saveMutation.mutate({
                      headline: payload.headline ?? undefined,
                      summary: payload.summary ?? undefined,
                      skills: payload.skills,
                      tools: payload.tools,
                      roles: payload.roles,
                      industries: payload.industries,
                      yearsOfExperience: payload.yearsOfExperience ?? undefined,
                      locations: payload.locations,
                      workModes: payload.workModes,
                      educationLines: payload.educationLines,
                      certificationLines: payload.certificationLines,
                      projectLines: payload.projectLines,
                      experienceLines: payload.experienceLines,
                      isConfirmed: payload.isConfirmed,
                    })
                  }
                />
              </>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}

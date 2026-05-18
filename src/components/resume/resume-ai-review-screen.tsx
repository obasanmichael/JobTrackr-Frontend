"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  ClipboardList,
  History,
  Layers,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listApplications } from "@/features/job-seeker/applications/api/applications-api";
import {
  createResumeReview,
  listResumeReviews,
} from "@/features/job-seeker/resume-reviews/api/resume-reviews-api";
import { listResumes } from "@/features/job-seeker/resume/api/resumes-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import type { ResumeReview, ResumeReviewStatus, ResumeReviewSuggestion, Resume } from "@/types";
import { cn } from "@/lib/utils";

function asStringList(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => {
      if (typeof entry === "string") return entry;
      if (typeof entry === "number") return String(entry);
      try {
        return JSON.stringify(entry);
      } catch {
        return "";
      }
    });
  }
  return [];
}

function asSuggestionList(value: unknown): ResumeReviewSuggestion[] {
  if (!Array.isArray(value)) return [];
  const out: ResumeReviewSuggestion[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const section = o.section;
    const issue = o.issue;
    const recommendation = o.recommendation;
    if (
      typeof section === "string" &&
      typeof issue === "string" &&
      typeof recommendation === "string"
    ) {
      out.push({ section, issue, recommendation });
    }
  }
  return out;
}

function resumeNameById(resumes: Resume[], id: string): string {
  return resumes.find((r) => r.id === id)?.fileName ?? "Resume";
}

function statusBadgeVariant(
  status: ResumeReviewStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "FAILED":
      return "destructive";
    case "PENDING":
      return "secondary";
    default:
      return "outline";
  }
}

function ScoreBar({
  label,
  value,
  className,
}: {
  label: string;
  value: number | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-muted/20 p-3 shadow-sm",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{value ?? "—"}</p>
      {value != null && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary/90 transition-[width]"
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ReviewDetail({ review }: { review: ResumeReview }) {
  const strengths = asStringList(review.strengths);
  const weaknesses = asStringList(review.weaknesses);
  const keywords = asStringList(review.missingKeywords);
  const bullets = asStringList(review.improvedBullets);
  const suggestions = asSuggestionList(review.suggestions);

  return (
    <div className="space-y-4 pt-2">
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Scores are <span className="font-medium text-foreground">indicative estimates</span> from
        the model—use them as a checklist, not a verdict on hiring outcomes or ATS behavior.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <ScoreBar label="Overall" value={review.overallScore} />
        <ScoreBar label="ATS fit" value={review.atsScore} />
        <ScoreBar label="Keywords" value={review.keywordScore} />
        <ScoreBar label="Structure" value={review.structureScore} />
        <ScoreBar label="Clarity" value={review.clarityScore} className="col-span-2 sm:col-span-1" />
      </div>

      {review.summary?.trim() && (
        <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Summary
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">{review.summary}</p>
        </div>
      )}

      {strengths.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-foreground">Strengths</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {weaknesses.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-foreground">Areas to improve</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {weaknesses.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {keywords.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-foreground">Keyword ideas</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {keywords.map((k, i) => (
              <Badge key={i} variant="outline" className="font-normal">
                {k}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {suggestions.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Targeted suggestions</p>
          <ul className="space-y-3">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="rounded-md border border-border/70 bg-card/50 px-3 py-2 text-sm"
              >
                <p className="font-medium text-foreground">{s.section}</p>
                <p className="mt-0.5 text-muted-foreground">{s.issue}</p>
                <p className="mt-1.5 text-foreground">
                  <span className="font-medium text-violet-700 dark:text-violet-300">Try: </span>
                  {s.recommendation}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {bullets.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-foreground">Bullet ideas</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function HistoryCard({
  review,
  resumeLabel,
}: {
  review: ResumeReview;
  resumeLabel: string;
}) {
  const created = format(parseISO(review.createdAt), "MMM d, yyyy · h:mm a");
  const openable = review.status === "COMPLETED";

  return (
    <details className="group rounded-lg border border-border/80 bg-card/40 overflow-hidden">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-start gap-3 p-4 text-left transition-colors hover:bg-muted/20",
          !openable && "cursor-default hover:bg-transparent"
        )}
        {...(!openable ? { onClick: (e) => e.preventDefault() } : {})}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={review.type === "GENERAL" ? "secondary" : "outline"}
              className="font-normal"
            >
              {review.type === "GENERAL" ? "General" : "Job-specific"}
            </Badge>
            <Badge variant={statusBadgeVariant(review.status)} className="font-normal capitalize">
              {review.status.toLowerCase()}
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground truncate">{resumeLabel}</p>
          <p className="text-xs text-muted-foreground">{created}</p>
          {review.status === "FAILED" && review.errorMessage && (
            <p className="flex items-start gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {review.errorMessage}
            </p>
          )}
        </div>
        {openable && (
          <span className="text-xs font-medium text-primary opacity-80 group-open:opacity-100">
            Details
          </span>
        )}
      </summary>
      {openable && (
        <div className="border-t border-border/60 bg-muted/5 px-4 py-3">
          <ReviewDetail review={review} />
        </div>
      )}
    </details>
  );
}

const REVIEWS_PAGE_SIZE = 20;

export function ResumeAiReviewScreen() {
  const queryClient = useQueryClient();
  const [pickedResumeId, setPickedResumeId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [pendingKind, setPendingKind] = useState<"GENERAL" | "JOB_SPECIFIC" | null>(null);

  const resumesQuery = useQuery({
    queryKey: ["resumes"],
    queryFn: listResumes,
  });

  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: () => listApplications(),
  });

  const eligibleResumes = useMemo(() => {
    const list = resumesQuery.data ?? [];
    return list.filter(
      (r) => r.status === "PARSED" && Boolean(r.parsedText?.trim()?.length)
    );
  }, [resumesQuery.data]);

  const resumeIdForReview = useMemo(() => {
    if (!eligibleResumes.length) return null;
    if (pickedResumeId && eligibleResumes.some((r) => r.id === pickedResumeId)) {
      return pickedResumeId;
    }
    const active = eligibleResumes.find((r) => r.isActive);
    return active?.id ?? eligibleResumes[0].id;
  }, [eligibleResumes, pickedResumeId]);

  const reviewsQuery = useQuery({
    queryKey: ["resume-reviews", { resumeId: resumeIdForReview }],
    queryFn: () =>
      listResumeReviews({
        resumeId: resumeIdForReview ?? undefined,
        page: 1,
        limit: REVIEWS_PAGE_SIZE,
      }),
    enabled:
      !resumesQuery.isLoading && Boolean(resumeIdForReview) && eligibleResumes.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: createResumeReview,
    onMutate: (variables) => setPendingKind(variables.type),
    onSuccess: (review) => {
      if (review.status === "COMPLETED") {
        toast.success("Review is ready.");
      } else {
        toast.message("Review saved.", {
          description: "Check history for the latest status.",
        });
      }
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
    onSettled: () => {
      setPendingKind(null);
      void queryClient.invalidateQueries({ queryKey: ["resume-reviews"] });
    },
  });

  const busy = createMutation.isPending;
  const selectedResume =
    eligibleResumes.find((r) => r.id === resumeIdForReview) ?? null;
  const applications = applicationsQuery.data ?? [];

  const canRunGeneral =
    Boolean(resumeIdForReview) && !busy && eligibleResumes.length > 0;
  const canRunJob =
    Boolean(resumeIdForReview) &&
    Boolean(applicationId) &&
    !busy &&
    eligibleResumes.length > 0 &&
    !applicationsQuery.isLoading;

  function runGeneral() {
    if (!resumeIdForReview) return;
    createMutation.mutate({
      type: "GENERAL",
      resumeId: resumeIdForReview,
    });
  }

  function runJobSpecific() {
    if (!resumeIdForReview || !applicationId) return;
    createMutation.mutate({
      type: "JOB_SPECIFIC",
      resumeId: resumeIdForReview,
      applicationId,
      jobDescription: jobDescription.trim() || undefined,
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI resume review"
        description="Structured, validated feedback on your CV—framed as suggestions you can apply, not a hiring scorecard."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/resume">Manage resumes</Link>
          </Button>
        }
      />

      <Card className="border-border/80 bg-muted/15 p-4 text-sm text-muted-foreground space-y-2">
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p>
            Artificial intelligence can miss nuance. Treat strengths, weaknesses, and keyword notes
            as <span className="font-medium text-foreground">suggested improvements</span>, not
            guarantees—especially around ATS scoring or hiring outcomes.
          </p>
        </div>
      </Card>

      {resumesQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      ) : eligibleResumes.length === 0 ? (
        <Card className="border-dashed border-border/80 p-6">
          <EmptyState
            title="No parsed resume ready"
            description="AI review needs a resume that finished parsing with extracted text. Upload a file on the Resume page and wait until the status is “Parsed.”"
            action={
              <Button asChild size="sm">
                <Link href="/dashboard/resume">Go to resumes</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <Card className="border-border/80 p-4 sm:p-5 space-y-2">
            <Label htmlFor="review-resume">Resume to review</Label>
            <Select value={resumeIdForReview ?? ""} onValueChange={setPickedResumeId}>
              <SelectTrigger id="review-resume" className="max-w-md">
                <SelectValue placeholder="Choose a resume" />
              </SelectTrigger>
              <SelectContent>
                {eligibleResumes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.fileName}
                    {r.isActive ? " · Active" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedResume && (
              <p className="text-xs text-muted-foreground">
                Using parsed text from{" "}
                <span className="font-medium text-foreground">{selectedResume.fileName}</span>.
              </p>
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="flex flex-col border-border/80 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-violet-500" />
                General resume review
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Broad feedback on clarity, structure, strengths, gaps, and concrete follow-up ideas.
              </p>
              <Separator className="my-4" />
              <Button className="w-full sm:w-auto" disabled={!canRunGeneral} onClick={runGeneral}>
                {busy && pendingKind === "GENERAL" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running review…
                  </>
                ) : (
                  "Run general review"
                )}
              </Button>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Each run counts toward your monthly AI review allowance. If you hit the limit, try
                again next month or contact support.
              </p>
            </Card>

            <Card className="flex flex-col border-border/80 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Layers className="h-4 w-4 text-blue-500" />
                Job-specific review
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Tailor feedback to a saved application. Optionally paste extra job description text
                for richer context.
              </p>

              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="application-pick">Application</Label>
                  <Select
                    value={applicationId}
                    onValueChange={setApplicationId}
                    disabled={applicationsQuery.isLoading || applications.length === 0}
                  >
                    <SelectTrigger id="application-pick">
                      <SelectValue
                        placeholder={
                          applicationsQuery.isLoading
                            ? "Loading applications…"
                            : applications.length === 0
                              ? "No applications yet"
                              : "Select an application"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {applications.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.jobTitle} · {a.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {applications.length === 0 && !applicationsQuery.isLoading && (
                    <p className="text-xs text-muted-foreground">
                      <ClipboardList className="inline h-3.5 w-3.5 mr-1 align-text-bottom" />
                      Add a tracked application first, then return here.{" "}
                      <Link href="/dashboard/applications/new" className="text-primary underline">
                        New application
                      </Link>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-desc-extra" className="text-muted-foreground">
                    Additional job description{" "}
                    <span className="font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    id="job-desc-extra"
                    placeholder="Paste the full posting or extra bullets if they are not already in your application notes."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={4}
                    className="resize-y min-h-[88px] text-sm"
                  />
                </div>
              </div>

              <Separator className="my-4" />
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={!canRunJob}
                onClick={runJobSpecific}
              >
                {busy && pendingKind === "JOB_SPECIFIC" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running review…
                  </>
                ) : (
                  "Run job-specific review"
                )}
              </Button>
            </Card>
          </div>
        </>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <History className="h-4 w-4 text-muted-foreground" />
          Review history
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl">
          Showing runs for the resume selected above. Open an entry to view scores and suggestions.
        </p>

        {reviewsQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : reviewsQuery.isError ? (
          <Card className="border-destructive/40 p-4 text-sm text-destructive">
            {getApiErrorMessage(reviewsQuery.error)}
          </Card>
        ) : !reviewsQuery.data?.items.length ? (
          <Card className="border-dashed border-border/80 bg-card/40">
            <EmptyState
              title="No reviews for this resume yet"
              description="Run a general or job-specific review and your results will show up here."
            />
          </Card>
        ) : (
          <ul className="space-y-3">
            {reviewsQuery.data.items.map((rev) => (
              <li key={rev.id}>
                <HistoryCard
                  review={rev}
                  resumeLabel={resumeNameById(resumesQuery.data ?? [], rev.resumeId)}
                />
              </li>
            ))}
          </ul>
        )}

        {reviewsQuery.data && reviewsQuery.data.total > reviewsQuery.data.items.length && (
          <p className="text-xs text-muted-foreground">
            Showing {reviewsQuery.data.items.length} of {reviewsQuery.data.total} matching reviews.
          </p>
        )}
      </section>
    </div>
  );
}

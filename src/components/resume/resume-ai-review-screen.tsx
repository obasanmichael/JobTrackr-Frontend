"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  History,
  Layers,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { listResumes } from "@/features/job-seeker/resume/api/resumes-api";

export function ResumeAiReviewScreen() {
  const resumesQuery = useQuery({
    queryKey: ["resumes"],
    queryFn: listResumes,
  });

  const active = resumesQuery.data?.find((r) => r.isActive);

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI resume review"
        description="Guided improvement suggestions for your CV—presented as guidance, not objective truth."
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col border-border/80 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-violet-500" />
            General resume review
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Request structured feedback covering clarity, relevance, strengths, gaps, and follow-up
            ideas.
          </p>
          <div className="mt-4 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            {active ? (
              <span className="flex flex-wrap items-center gap-2">
                Active resume:&nbsp;
                <Badge variant="secondary" className="font-normal truncate max-w-full">
                  {active.fileName}
                </Badge>
              </span>
            ) : (
              "Select an active resume from the Resume page before the review API is connected."
            )}
          </div>
          <Button className="mt-5 w-full sm:w-auto" disabled>
            Run general review
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Disabled until the AI review endpoint from the V2 backend is available.
          </p>
        </Card>

        <Card className="flex flex-col border-border/80 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Layers className="h-4 w-4 text-blue-500" />
            Job-specific resume review
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Compare your resume to a saved job posting for targeted gaps and keyword ideas.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ClipboardList className="h-3.5 w-3.5" />
              Requires a tracked application or saved job listing (coming with job board UX).
            </span>
          </div>
          <Button className="mt-5 w-full sm:w-auto" variant="secondary" disabled>
            Run job-specific review
          </Button>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <History className="h-4 w-4 text-muted-foreground" />
          Review history
        </div>
        <Card className="border-dashed border-border/80 bg-card/40">
          <EmptyState
            title="No reviews yet"
            description="Past runs will appear here with scores, sections, and notes—once the backend stores review history."
          />
        </Card>
      </section>
    </div>
  );
}

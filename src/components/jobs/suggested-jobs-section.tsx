"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchMatchedJobs } from "@/features/job-seeker/jobs/api/jobs-api";

const SUGGESTED_LIMIT = 6;

export function SuggestedJobsSection() {
  const matchesQuery = useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatchedJobs,
    staleTime: 5 * 60_000,
  });

  if (matchesQuery.isPending) {
    return (
      <section className="space-y-3">
        <SectionHeading />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </section>
    );
  }

  // Suggestions are an enhancement on this page — never block the board.
  if (matchesQuery.isError) {
    return null;
  }

  const data = matchesQuery.data;

  if (data.requiresProfile) {
    return (
      <section className="space-y-3">
        <SectionHeading />
        <Card className="flex flex-wrap items-center justify-between gap-3 border-dashed border-border/80 p-4">
          <p className="text-sm text-muted-foreground">
            Upload your resume and we&apos;ll suggest jobs that fit your profile
            — no searching needed.
          </p>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/dashboard/resume">Upload resume</Link>
          </Button>
        </Card>
      </section>
    );
  }

  if (data.matches.length === 0) {
    return null;
  }

  const top = data.matches.slice(0, SUGGESTED_LIMIT);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <SectionHeading />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/matches">
            See all matches
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((match) => (
          <Card
            key={match.job.id}
            className="flex flex-col gap-2 border-border/80 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-0.5">
                <Link
                  href={`/dashboard/jobs/${match.job.id}`}
                  className="line-clamp-2 text-sm font-semibold text-foreground hover:underline"
                >
                  {match.job.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {match.job.companyName}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full bg-sidebar-primary/15 px-2 py-0.5 text-xs font-semibold text-sidebar-primary"
                title="Match score"
              >
                {match.overallScore}
              </span>
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {match.matchReason}
            </p>
            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/dashboard/jobs/${match.job.id}`}>Details</Link>
              </Button>
              {match.job.applyUrl ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={match.job.applyUrl} target="_blank" rel="noreferrer">
                    Apply
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SectionHeading() {
  return (
    <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
      <Sparkles className="h-4 w-4 text-sidebar-primary" />
      Suggested for you
    </h2>
  );
}

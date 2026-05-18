"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ExternalLink, MapPin, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { searchJobs } from "@/features/job-seeker/jobs/api/jobs-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { JOB_BOARD_WORK_MODE_API } from "@/lib/constants";
import type { JobBoardListing } from "@/types";

function JobCard({ job }: { job: JobBoardListing }) {
  const salaryParts =
    job.salaryMin != null || job.salaryMax != null
      ? [job.salaryMin, job.salaryMax].map((n) =>
          n != null ? n.toLocaleString() : null
        )
      : [];
  const salary = salaryParts.filter(Boolean).join(" – ");

  return (
    <Card className="flex flex-col gap-3 border-border/80 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{job.title}</p>
        <p className="text-sm text-muted-foreground">{job.companyName}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        )}
        {job.workMode && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            {job.workMode}
          </span>
        )}
        {job.source && (
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px]">
            Source: {job.source}
          </span>
        )}
      </div>
      {salary && (
        <p className="text-xs text-muted-foreground">
          {salary} {job.currency ?? ""}
        </p>
      )}
      {job.postedAt && (
        <p className="text-[11px] text-muted-foreground">
          Posted {format(parseISO(job.postedAt), "MMM d, yyyy")}
        </p>
      )}
      {job.excerpt && (
        <p className="line-clamp-3 text-xs text-muted-foreground">{job.excerpt}</p>
      )}
      {job.applyUrl && (
        <Button variant="outline" size="sm" className="w-fit" asChild>
          <a href={job.applyUrl} target="_blank" rel="noreferrer">
            View posting
            <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </a>
        </Button>
      )}
    </Card>
  );
}

export function JobsBoardScreen() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<string>(JOB_BOARD_WORK_MODE_API[0].value);
  const [searched, setSearched] = useState(false);

  const [submittedFilters, setSubmittedFilters] = useState<{
    q?: string;
    location?: string;
    workMode?: string;
  }>({});

  const queryParams = useMemo(() => {
    const params: { q?: string; location?: string; workMode?: string } = {};
    if (submittedFilters.q?.trim()) params.q = submittedFilters.q.trim();
    if (submittedFilters.location?.trim()) {
      params.location = submittedFilters.location.trim();
    }
    if (submittedFilters.workMode && submittedFilters.workMode !== "UNSPECIFIED") {
      params.workMode = submittedFilters.workMode;
    }
    return params;
  }, [submittedFilters]);

  const jobsQuery = useQuery({
    queryKey: ["jobs", queryParams],
    queryFn: () => searchJobs({ ...queryParams, page: 1, limit: 20 }),
    enabled: searched,
  });

  function runSearch() {
    setSearched(true);
    setSubmittedFilters({
      q: q.trim(),
      location: location.trim(),
      workMode,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Discover roles aggregated from linked boards once ingestion is wired. Filters call your backend contract today so the UX stays aligned with future data."
      />

      <Card className="space-y-4 border-border/80 p-5">
        <div className="grid gap-4 md:grid-cols-12">
          <div className="space-y-2 md:col-span-5">
            <Label htmlFor="job-keyword">Keywords</Label>
            <Input
              id="job-keyword"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Role title or stack…"
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
            />
          </div>
          <div className="space-y-2 md:col-span-4">
            <Label htmlFor="job-location">Location</Label>
            <Input
              id="job-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, country"
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Work mode</Label>
            <Select value={workMode} onValueChange={setWorkMode}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {JOB_BOARD_WORK_MODE_API.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={runSearch} className="inline-flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search jobs
          </Button>
          <span className="text-xs text-muted-foreground">
            Calls <span className="rounded bg-muted px-1 py-0.5 font-mono">GET /jobs</span>
          </span>
        </div>
      </Card>

      {!searched ? (
        <EmptyState
          icon={Search}
          title="Run a search to load results"
          description="Aggregation may return zero rows until job sources sync—still useful to validate filters and pagination."
          action={
            <Button type="button" variant="secondary" onClick={runSearch}>
              Search with current filters
            </Button>
          }
        />
      ) : jobsQuery.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : jobsQuery.isError ? (
        <Card className="border-destructive/40 p-6 text-sm text-destructive">
          {getApiErrorMessage(jobsQuery.error)}{" "}
          <button type="button" className="underline" onClick={() => jobsQuery.refetch()}>
            Retry
          </button>
        </Card>
      ) : jobsQuery.data && jobsQuery.data.total === 0 ? (
        <EmptyState
          title="No listings matched"
          description="The feed is empty until job aggregation lands. Your query parameters still reach the API for early integration testing."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Showing {jobsQuery.data?.jobs.length ?? 0} of {jobsQuery.data?.total ?? 0} · Page{" "}
            {jobsQuery.data?.page ?? 1}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {jobsQuery.data?.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

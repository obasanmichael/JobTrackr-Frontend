"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
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
import {
  searchJobs,
  type JobSearchParams,
} from "@/features/job-seeker/jobs/api/jobs-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import {
  JOB_BOARD_EXPERIENCE_LEVEL_API,
  JOB_BOARD_POSTED_WITHIN_API,
  JOB_BOARD_POSTED_WITHIN_ANY,
  JOB_BOARD_WORK_MODE_API,
} from "@/lib/constants";
import {
  findBookmarkForJobId,
  fetchSavedJobsBookmarks,
  isBookmarkedRow,
  migrateLegacySavedJobIdsOnce,
  savedJobsBookmarksQueryKey,
  toggleSavedJobBookmark,
  type SavedBookmarkRow,
} from "@/features/job-seeker/jobs/lib/saved-jobs-hooks-support";
import { SuggestedJobsSection } from "@/components/jobs/suggested-jobs-section";
import type { JobBoardListing } from "@/types";

function JobCard({
  job,
  bookmarkRow,
  onToggleBookmark,
  bookmarkBusy,
}: {
  job: JobBoardListing;
  bookmarkRow: SavedBookmarkRow | undefined;
  onToggleBookmark: () => void;
  bookmarkBusy: boolean;
}) {
  const saved = isBookmarkedRow(bookmarkRow);
  const salaryParts =
    job.salaryMin != null || job.salaryMax != null
      ? [job.salaryMin, job.salaryMax].map((n) =>
          n != null ? n.toLocaleString() : null,
        )
      : [];
  const salary = salaryParts.filter(Boolean).join(" – ");

  return (
    <Card className="flex flex-col gap-3 border-border/80 p-4">
      <div className="space-y-1">
        <Link
          href={`/dashboard/jobs/${job.id}`}
          className="text-sm font-semibold text-foreground hover:underline"
        >
          {job.title}
        </Link>
        <p className="text-sm text-muted-foreground">{job.companyName}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {job.location ? (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        ) : null}
        {job.workMode ? (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            {job.workMode}
          </span>
        ) : null}
        {job.source ? (
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px]">
            Source: {job.source}
          </span>
        ) : null}
      </div>
      {salary ? (
        <p className="text-xs text-muted-foreground">
          {salary} {job.currency ?? ""}
        </p>
      ) : null}
      {job.postedAt ? (
        <p className="text-[11px] text-muted-foreground">
          Posted {format(parseISO(job.postedAt), "MMM d, yyyy")}
        </p>
      ) : null}
      {job.excerpt ? (
        <p className="line-clamp-3 text-xs text-muted-foreground">{job.excerpt}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          disabled={bookmarkBusy}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleBookmark();
          }}
        >
          {saved ? (
            <BookmarkCheck className="mr-2 h-3.5 w-3.5" />
          ) : (
            <Bookmark className="mr-2 h-3.5 w-3.5" />
          )}
          {saved ? "Saved" : "Save"}
        </Button>
        <Button variant="secondary" size="sm" className="w-fit" asChild>
          <Link href={`/dashboard/jobs/${job.id}`}>View details</Link>
        </Button>
        {job.applyUrl ? (
          <Button variant="outline" size="sm" className="w-fit" asChild>
            <a href={job.applyUrl} target="_blank" rel="noreferrer">
              Apply
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

type FilterFormState = {
  q: string;
  location: string;
  workMode: string;
  experienceLevel: string;
  salaryMin: string;
  source: string;
  postedWithin: string;
};

export function JobsBoardScreen() {
  const queryClient = useQueryClient();
  const migrationRan = useRef(false);
  const [form, setForm] = useState<FilterFormState>({
    q: "",
    location: "",
    workMode: JOB_BOARD_WORK_MODE_API[0].value,
    experienceLevel: JOB_BOARD_EXPERIENCE_LEVEL_API[0].value,
    salaryMin: "",
    source: "",
    postedWithin: JOB_BOARD_POSTED_WITHIN_API[0].value,
  });
  const [searched, setSearched] = useState(false);
  const [submittedFilters, setSubmittedFilters] = useState<FilterFormState>(form);

  const queryParams = useMemo((): JobSearchParams => {
    const params: JobSearchParams = { page: 1, limit: 20 };
    if (submittedFilters.q.trim()) params.q = submittedFilters.q.trim();
    if (submittedFilters.location.trim()) {
      params.location = submittedFilters.location.trim();
    }
    if (submittedFilters.workMode && submittedFilters.workMode !== "UNSPECIFIED") {
      params.workMode = submittedFilters.workMode;
    }
    if (
      submittedFilters.experienceLevel &&
      submittedFilters.experienceLevel !== "UNSPECIFIED"
    ) {
      params.experienceLevel = submittedFilters.experienceLevel;
    }
    const salaryMin = Number(submittedFilters.salaryMin);
    if (Number.isFinite(salaryMin) && salaryMin > 0) {
      params.salaryMin = salaryMin;
    }
    if (submittedFilters.source.trim()) {
      params.source = submittedFilters.source.trim();
    }
    if (
      submittedFilters.postedWithin &&
      submittedFilters.postedWithin !== JOB_BOARD_POSTED_WITHIN_ANY
    ) {
      params.postedWithin = Number(submittedFilters.postedWithin);
    }
    return params;
  }, [submittedFilters]);

  const bookmarksQuery = useQuery({
    queryKey: savedJobsBookmarksQueryKey(),
    queryFn: () => fetchSavedJobsBookmarks(),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (migrationRan.current) {
      return;
    }
    migrationRan.current = true;
    void migrateLegacySavedJobIdsOnce().then(() =>
      queryClient.invalidateQueries({ queryKey: savedJobsBookmarksQueryKey() }),
    );
  }, [queryClient]);

  const bookmarkToggleMutation = useMutation({
    mutationFn: async ({ jobId, row }: { jobId: string; row: SavedBookmarkRow | undefined }) =>
      toggleSavedJobBookmark(jobId, row),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: savedJobsBookmarksQueryKey() });
    },
  });

  const jobsQuery = useQuery({
    queryKey: ["jobs", queryParams],
    queryFn: () => searchJobs(queryParams),
    enabled: searched,
  });

  function runSearch() {
    setSearched(true);
    setSubmittedFilters({ ...form });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Search aggregated listings from linked ATS boards. Open a role for match score, save, and tracker actions."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/jobs/submit">
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit careers page
            </Link>
          </Button>
        }
      />

      <SuggestedJobsSection />

      <Card className="space-y-4 border-border/80 p-5">
        <div className="grid gap-4 md:grid-cols-12">
          <div className="space-y-2 md:col-span-4">
            <Label htmlFor="job-keyword">Keywords</Label>
            <Input
              id="job-keyword"
              value={form.q}
              onChange={(e) => setForm((prev) => ({ ...prev, q: e.target.value }))}
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
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="City, country"
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
            />
          </div>
          <div className="space-y-2 md:col-span-4">
            <Label htmlFor="job-source">Source name</Label>
            <Input
              id="job-source"
              value={form.source}
              onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
              placeholder="e.g. Greenhouse board name"
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Work mode</Label>
            <Select
              value={form.workMode}
              onValueChange={(value) => setForm((prev) => ({ ...prev, workMode: value }))}
            >
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
          <div className="space-y-2 md:col-span-3">
            <Label>Experience</Label>
            <Select
              value={form.experienceLevel}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, experienceLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any level" />
              </SelectTrigger>
              <SelectContent>
                {JOB_BOARD_EXPERIENCE_LEVEL_API.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="job-salary-min">Min salary</Label>
            <Input
              id="job-salary-min"
              type="number"
              min={0}
              value={form.salaryMin}
              onChange={(e) => setForm((prev) => ({ ...prev, salaryMin: e.target.value }))}
              placeholder="100000"
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Posted within</Label>
            <Select
              value={form.postedWithin}
              onValueChange={(value) => setForm((prev) => ({ ...prev, postedWithin: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                {JOB_BOARD_POSTED_WITHIN_API.map((option) => (
                  <SelectItem key={option.label} value={option.value}>
                    {option.label}
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
        </div>
      </Card>

      {!searched ? (
        <EmptyState
          icon={Search}
          title="Run a search to load results"
          description="Results appear once job sources sync. All backend filters are wired here."
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
          description="Try broadening filters or wait for more sources to sync."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Showing {jobsQuery.data?.jobs.length ?? 0} of {jobsQuery.data?.total ?? 0} · Page{" "}
            {jobsQuery.data?.page ?? 1}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {jobsQuery.data?.jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                bookmarkRow={findBookmarkForJobId(bookmarksQuery.data?.items ?? [], job.id)}
                bookmarkBusy={
                  bookmarksQuery.isPending || bookmarkToggleMutation.isPending
                }
                onToggleBookmark={() =>
                  bookmarkToggleMutation.mutate({
                    jobId: job.id,
                    row: findBookmarkForJobId(bookmarksQuery.data?.items ?? [], job.id),
                  })
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

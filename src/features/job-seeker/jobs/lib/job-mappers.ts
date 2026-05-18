import type { JobBoardListing, JobSearchResult } from "@/types";

export interface JobListingApiRecord {
  id: string;
  title: string;
  companyName: string;
  location?: string | null;
  workMode?: string | null;
  applyUrl?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  source?: string | null;
  postedAt?: string | null;
  excerpt?: string | null;
}

export interface JobSearchResponseApi {
  jobs: JobListingApiRecord[];
  total: number;
  page: number;
  limit: number;
}

function jobFromApi(record: JobListingApiRecord): JobBoardListing {
  return {
    id: record.id,
    title: record.title,
    companyName: record.companyName,
    location: record.location,
    workMode: record.workMode,
    applyUrl: record.applyUrl,
    salaryMin: record.salaryMin,
    salaryMax: record.salaryMax,
    currency: record.currency,
    source: record.source,
    postedAt: record.postedAt,
    excerpt: record.excerpt,
  };
}

export function jobSearchFromApi(raw: JobSearchResponseApi): JobSearchResult {
  return {
    jobs: raw.jobs.map(jobFromApi),
    total: raw.total,
    page: raw.page,
    limit: raw.limit,
  };
}

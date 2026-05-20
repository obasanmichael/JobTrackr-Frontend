import type { Currency, WorkMode } from "@/lib/constants";
import type {
  CreateApplicationPayload,
  JobBoardDetail,
  JobBoardListing,
  JobSingleMatch,
  JobSearchResult,
  MatchedJobsResult,
} from "@/types";

export interface JobListingSourceMetaApi {
  name: string;
  type: string;
}

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
  sourceMeta?: JobListingSourceMetaApi | null;
  postedAt?: string | null;
  excerpt?: string | null;
}

export interface JobDetailApiRecord extends JobListingApiRecord {
  description?: string | null;
  requirements?: string | null;
  experienceLevel?: string | null;
  employmentType?: string | null;
  country?: string | null;
}

export interface JobSearchResponseApi {
  jobs: JobListingApiRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface JobMatchItemApi {
  overallScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  titleScore: number;
  skillScore: number;
  experienceScore: number;
  locationScore: number;
  recencyScore: number;
  requiresProfile?: boolean;
  job: JobListingApiRecord;
}

export interface JobMatchListResponseApi {
  matches: JobMatchItemApi[];
  total: number;
  requiresProfile: boolean;
  generatedAt?: string | null;
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
    sourceMeta: record.sourceMeta ?? null,
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

export function jobDetailFromApi(raw: JobDetailApiRecord): JobBoardDetail {
  return {
    ...jobFromApi(raw),
    description: raw.description,
    requirements: raw.requirements,
    experienceLevel: raw.experienceLevel,
    employmentType: raw.employmentType,
    country: raw.country,
  };
}

export function jobSingleMatchFromApi(raw: JobMatchItemApi): JobSingleMatch {
  return {
    overallScore: raw.overallScore,
    matchReason: raw.matchReason,
    matchedSkills: raw.matchedSkills,
    missingSkills: raw.missingSkills,
    requiresProfile: raw.requiresProfile ?? false,
    titleScore: raw.titleScore,
    skillScore: raw.skillScore,
    experienceScore: raw.experienceScore,
    locationScore: raw.locationScore,
    recencyScore: raw.recencyScore,
    job: jobFromApi(raw.job),
  };
}

export function matchedJobsFromApi(raw: JobMatchListResponseApi): MatchedJobsResult {
  return {
    matches: raw.matches.map(jobSingleMatchFromApi),
    total: raw.total,
    requiresProfile: raw.requiresProfile,
    generatedAt: raw.generatedAt ?? null,
  };
}

const WORK_MODE_FROM_API: Record<string, WorkMode> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "Onsite",
  UNSPECIFIED: "Unspecified",
};

const ALLOWED_CURRENCIES = new Set<Currency>([
  "USD",
  "GBP",
  "EUR",
  "CAD",
  "AUD",
  "NGN",
  "Other",
]);

export function jobDetailToCreateApplicationPayload(
  job: JobBoardDetail,
): CreateApplicationPayload {
  const currency =
    job.currency && ALLOWED_CURRENCIES.has(job.currency as Currency)
      ? (job.currency as Currency)
      : undefined;

  const workMode =
    job.workMode && WORK_MODE_FROM_API[job.workMode]
      ? WORK_MODE_FROM_API[job.workMode]
      : undefined;

  const sourceLabel = job.sourceMeta?.name ?? job.source;

  return {
    jobTitle: job.title,
    company: job.companyName,
    status: "Saved",
    jobUrl: job.applyUrl ?? undefined,
    location: job.location ?? undefined,
    workMode,
    salaryMin: job.salaryMin ?? undefined,
    salaryMax: job.salaryMax ?? undefined,
    currency,
    source: "Other",
    notes: sourceLabel ? `Discovered via ${sourceLabel}` : undefined,
  };
}

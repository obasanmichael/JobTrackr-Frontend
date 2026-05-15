import type {
  Application,
  CreateApplicationPayload,
  UpdateApplicationPayload,
} from "@/types";
import type { Currency } from "@/lib/constants";
import type {
  ApplicationStatus as UiApplicationStatus,
  JobSource as UiJobSource,
  WorkMode as UiWorkMode,
} from "@/lib/constants";

/** Shape returned by Nest `ApplicationResponseDto` over JSON. */
export interface ApplicationApiRecord {
  id: string;
  userId: string;
  jobTitle: string;
  companyName: string;
  jobUrl?: string | null;
  location?: string | null;
  workMode: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  status: string;
  source?: string | null;
  deadline?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_TO_API: Record<UiApplicationStatus, string> = {
  Saved: "SAVED",
  Applied: "APPLIED",
  Screening: "SCREENING",
  Interview: "INTERVIEW",
  "Technical Assessment": "TECHNICAL_ASSESSMENT",
  "Final Interview": "FINAL_INTERVIEW",
  Offer: "OFFER",
  Rejected: "REJECTED",
  Withdrawn: "WITHDRAWN",
};

const STATUS_FROM_API: Record<string, UiApplicationStatus> = Object.fromEntries(
  Object.entries(STATUS_TO_API).map(([ui, api]) => [api, ui as UiApplicationStatus])
) as Record<string, UiApplicationStatus>;

const WORK_TO_API: Record<UiWorkMode, string> = {
  Remote: "REMOTE",
  Hybrid: "HYBRID",
  Onsite: "ONSITE",
  Unspecified: "UNSPECIFIED",
};

const WORK_FROM_API: Record<string, UiWorkMode> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "Onsite",
  UNSPECIFIED: "Unspecified",
};

const SOURCE_TO_API: Record<UiJobSource, string> = {
  LinkedIn: "LINKEDIN",
  "Company Website": "COMPANY_WEBSITE",
  Referral: "REFERRAL",
  Indeed: "INDEED",
  "Twitter/X": "TWITTER",
  Email: "EMAIL",
  Other: "OTHER",
};

const SOURCE_FROM_API: Record<string, UiJobSource> = {
  LINKEDIN: "LinkedIn",
  COMPANY_WEBSITE: "Company Website",
  REFERRAL: "Referral",
  INDEED: "Indeed",
  TWITTER: "Twitter/X",
  EMAIL: "Email",
  OTHER: "Other",
};

export function applicationFromApi(record: ApplicationApiRecord): Application {
  const deadline =
    record.deadline == null
      ? undefined
      : typeof record.deadline === "string"
        ? record.deadline
        : new Date(record.deadline as unknown as Date).toISOString();

  return {
    id: record.id,
    userId: record.userId,
    jobTitle: record.jobTitle,
    company: record.companyName,
    status: STATUS_FROM_API[record.status] ?? "Saved",
    jobUrl: record.jobUrl ?? undefined,
    location: record.location ?? undefined,
    workMode: WORK_FROM_API[record.workMode] ?? "Unspecified",
    salaryMin: record.salaryMin ?? undefined,
    salaryMax: record.salaryMax ?? undefined,
    currency: (record.currency ?? undefined) as Currency | undefined,
    source: record.source
      ? SOURCE_FROM_API[record.source] ?? "Other"
      : undefined,
    deadline,
    notes: record.notes ?? undefined,
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : new Date(record.createdAt as unknown as Date).toISOString(),
    updatedAt:
      typeof record.updatedAt === "string"
        ? record.updatedAt
        : new Date(record.updatedAt as unknown as Date).toISOString(),
  };
}

export function createPayloadToApi(
  payload: CreateApplicationPayload
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    jobTitle: payload.jobTitle,
    companyName: payload.company,
    status: STATUS_TO_API[payload.status],
  };
  if (payload.jobUrl) body.jobUrl = payload.jobUrl;
  if (payload.location !== undefined && payload.location !== "")
    body.location = payload.location;
  if (payload.workMode) body.workMode = WORK_TO_API[payload.workMode];
  if (payload.salaryMin !== undefined) body.salaryMin = payload.salaryMin;
  if (payload.salaryMax !== undefined) body.salaryMax = payload.salaryMax;
  if (payload.currency) body.currency = payload.currency;
  if (payload.source) body.source = SOURCE_TO_API[payload.source];
  if (payload.deadline) body.deadline = payload.deadline;
  if (payload.notes !== undefined && payload.notes !== "")
    body.notes = payload.notes;
  return body;
}

export function updatePayloadToApi(
  payload: UpdateApplicationPayload
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.jobTitle !== undefined) body.jobTitle = payload.jobTitle;
  if (payload.company !== undefined) body.companyName = payload.company;
  if (payload.status !== undefined) body.status = STATUS_TO_API[payload.status];
  if (payload.jobUrl !== undefined)
    body.jobUrl = payload.jobUrl === "" ? undefined : payload.jobUrl;
  if (payload.location !== undefined)
    body.location = payload.location === "" ? undefined : payload.location;
  if (payload.workMode !== undefined)
    body.workMode = WORK_TO_API[payload.workMode];
  if (payload.salaryMin !== undefined) body.salaryMin = payload.salaryMin;
  if (payload.salaryMax !== undefined) body.salaryMax = payload.salaryMax;
  if (payload.currency !== undefined) body.currency = payload.currency;
  if (payload.source !== undefined)
    body.source = SOURCE_TO_API[payload.source];
  if (payload.deadline !== undefined) body.deadline = payload.deadline;
  if (payload.notes !== undefined)
    body.notes = payload.notes === "" ? undefined : payload.notes;
  return body;
}

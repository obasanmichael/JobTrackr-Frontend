import type {
  ApplicationStatus,
  WorkMode,
  JobSource,
  InterviewStage,
  InterviewType,
  TimelineEventType,
  Currency,
} from "@/lib/constants";

/* ─── Auth ───────────────────────────────────────────────────────────────── */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/* ─── Applications ───────────────────────────────────────────────────────── */

export interface Application {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  jobUrl?: string;
  location?: string;
  workMode?: WorkMode;
  salaryMin?: number;
  salaryMax?: number;
  currency?: Currency;
  source?: JobSource;
  deadline?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationPayload {
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  jobUrl?: string;
  location?: string;
  workMode?: WorkMode;
  salaryMin?: number;
  salaryMax?: number;
  currency?: Currency;
  source?: JobSource;
  deadline?: string;
  notes?: string;
}

export type UpdateApplicationPayload = Partial<CreateApplicationPayload>;

/* ─── Timeline Events ────────────────────────────────────────────────────── */

export interface TimelineEvent {
  id: string;
  applicationId: string;
  type: TimelineEventType;
  content: string;
  createdAt: string;
}

export interface CreateTimelineEventPayload {
  type: TimelineEventType;
  content: string;
}

/* ─── Reminders ──────────────────────────────────────────────────────────── */

export interface Reminder {
  id: string;
  userId: string;
  applicationId?: string;
  application?: Pick<Application, "id" | "jobTitle" | "company">;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderPayload {
  title: string;
  description?: string;
  dueDate: string;
  applicationId?: string;
}

export interface UpdateReminderPayload extends Partial<CreateReminderPayload> {
  completed?: boolean;
}

/* ─── Interviews ─────────────────────────────────────────────────────────── */

export interface Interview {
  id: string;
  userId: string;
  applicationId: string;
  application?: Pick<Application, "id" | "jobTitle" | "company">;
  stage: InterviewStage;
  type: InterviewType;
  scheduledAt?: string;
  location?: string;
  notes?: string;
  outcome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewPayload {
  applicationId: string;
  stage: InterviewStage;
  type: InterviewType;
  scheduledAt?: string;
  location?: string;
  notes?: string;
  outcome?: string;
}

export type UpdateInterviewPayload = Partial<CreateInterviewPayload>;

/* ─── Dashboard ──────────────────────────────────────────────────────────── */

export interface DashboardSummary {
  totalApplications: number;
  activeApplications: number;
  offerCount: number;
  rejectionCount: number;
  byStatus: Record<string, number>;
  upcomingReminders: Reminder[];
  upcomingInterviews: Interview[];
  recentEvents: TimelineEvent[];
}

/* ─── API Responses ──────────────────────────────────────────────────────── */

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/* ─── Resumes & candidate profile (V2) ─────────────────────────────────── */

export type ResumeParseStatus =
  | "UPLOADED"
  | "PARSING"
  | "PARSED"
  | "FAILED"
  | "ARCHIVED";

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  /** Original file URL when backend exposes it */
  fileUrl?: string | null;
  status: ResumeParseStatus;
  parsedText?: string | null;
  parseError?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Normalized profile for forms (JSON arrays collapsed to string lists where helpful) */
export interface CandidateProfile {
  id: string;
  userId: string;
  resumeId: string;
  headline?: string | null;
  summary?: string | null;
  /** String tags for editing */
  skills: string[];
  tools: string[];
  roles: string[];
  industries: string[];
  yearsOfExperience?: number | null;
  locations: string[];
  workModes: string[];
  educationLines: string[];
  certificationLines: string[];
  projectLines: string[];
  experienceLines: string[];
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** PATCH `/resumes/:id` — backend allows `ARCHIVED` only when updating status. */
export interface UpdateResumePayload {
  isActive?: boolean;
  status?: Extract<ResumeParseStatus, "ARCHIVED">;
}

export interface UpdateCandidateProfilePayload {
  headline?: string | null;
  summary?: string | null;
  skills?: string[];
  tools?: string[];
  roles?: string[];
  industries?: string[];
  yearsOfExperience?: number | null;
  locations?: string[];
  workModes?: string[];
  educationLines?: string[];
  certificationLines?: string[];
  projectLines?: string[];
  experienceLines?: string[];
  isConfirmed?: boolean;
}

export interface JobBoardListing {
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

export interface JobSearchResult {
  jobs: JobBoardListing[];
  total: number;
  page: number;
  limit: number;
}

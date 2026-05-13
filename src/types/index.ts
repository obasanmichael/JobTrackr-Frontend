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

export interface UpdateApplicationPayload extends Partial<CreateApplicationPayload> {}

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

export interface UpdateInterviewPayload extends Partial<CreateInterviewPayload> {}

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

import { api } from "@/shared/lib/http-client";
import { eventFromApi } from "@/features/job-seeker/applications/lib/timeline-mappers";
import type { ApplicationEventApiRecord } from "@/features/job-seeker/applications/lib/timeline-mappers";
import type { DashboardSummary, Reminder, Interview } from "@/types";

/* ── Raw shapes returned by /dashboard/summary ───────────────────────────── */

interface DashboardReminderItem {
  id: string;
  applicationId: string;
  title: string;
  dueDate: string;
}

interface DashboardInterviewItem {
  id: string;
  applicationId: string;
  stage: string;
  interviewType: string;
  scheduledAt: string;
}

interface DashboardApiResponse {
  totalApplications: number;
  activeApplications: number;
  offerCount: number;
  rejectionCount: number;
  applicationsByStatus: Record<string, number>;
  upcomingReminders: DashboardReminderItem[];
  upcomingInterviews: DashboardInterviewItem[];
  recentEvents: ApplicationEventApiRecord[];
}

/* ── Status key mapping: API → UI ────────────────────────────────────────── */

const STATUS_FROM_API: Record<string, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  TECHNICAL_ASSESSMENT: "Technical Assessment",
  FINAL_INTERVIEW: "Final Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const STAGE_FROM_API: Record<string, string> = {
  RECRUITER_SCREEN: "Recruiter Screen",
  TECHNICAL_INTERVIEW: "Technical Interview",
  TECHNICAL_ASSESSMENT: "Technical Assessment",
  HIRING_MANAGER: "Hiring Manager Interview",
  FINAL_INTERVIEW: "Final Interview",
  OFFER_DISCUSSION: "Offer Discussion",
  OTHER: "Other",
};

const TYPE_FROM_API: Record<string, string> = {
  PHONE: "Phone",
  VIDEO: "Video",
  ONSITE: "Onsite",
  TAKE_HOME: "Take-home",
  LIVE_CODING: "Live Coding",
  OTHER: "Other",
};

const toIso = (v: string) =>
  typeof v === "string" ? v : new Date(v as unknown as Date).toISOString();

/* ── Mappers ─────────────────────────────────────────────────────────────── */

function mapDashboardReminder(item: DashboardReminderItem): Reminder {
  return {
    id: item.id,
    userId: "",
    applicationId: item.applicationId,
    title: item.title,
    dueDate: toIso(item.dueDate),
    completed: false,
    createdAt: "",
    updatedAt: "",
  };
}

function mapDashboardInterview(item: DashboardInterviewItem): Interview {
  return {
    id: item.id,
    userId: "",
    applicationId: item.applicationId,
    stage: (STAGE_FROM_API[item.stage] ?? "Other") as Interview["stage"],
    type: (TYPE_FROM_API[item.interviewType] ?? "Other") as Interview["type"],
    scheduledAt: toIso(item.scheduledAt),
    createdAt: "",
    updatedAt: "",
  };
}

/* ── Main export ─────────────────────────────────────────────────────────── */

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardApiResponse>("/dashboard/summary");

  const byStatus: Record<string, number> = {};
  for (const [apiKey, count] of Object.entries(data.applicationsByStatus)) {
    const uiKey = STATUS_FROM_API[apiKey] ?? apiKey;
    byStatus[uiKey] = count;
  }

  return {
    totalApplications: data.totalApplications,
    activeApplications: data.activeApplications,
    offerCount: data.offerCount,
    rejectionCount: data.rejectionCount,
    byStatus,
    upcomingReminders: data.upcomingReminders.map(mapDashboardReminder),
    upcomingInterviews: data.upcomingInterviews.map(mapDashboardInterview),
    recentEvents: data.recentEvents.map(eventFromApi),
  };
}

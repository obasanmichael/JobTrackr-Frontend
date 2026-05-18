export const APP_NAME = "JobTrackr";

/** Mirrors backend `RESUME_UPLOAD_MAX_BYTES` default (5 MiB) */
export const RESUME_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export const APPLICATION_STATUSES = [
  "Saved",
  "Applied",
  "Screening",
  "Interview",
  "Technical Assessment",
  "Final Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const WORK_MODES = ["Remote", "Hybrid", "Onsite", "Unspecified"] as const;
export type WorkMode = (typeof WORK_MODES)[number];

/** Work mode filter values for aggregated job search (matches API `WorkMode`) */
export const JOB_BOARD_WORK_MODE_API = [
  { value: "UNSPECIFIED", label: "Any" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "Onsite" },
] as const;

export const JOB_SOURCES = [
  "LinkedIn",
  "Company Website",
  "Referral",
  "Indeed",
  "Twitter/X",
  "Email",
  "Other",
] as const;
export type JobSource = (typeof JOB_SOURCES)[number];

export const INTERVIEW_STAGES = [
  "Recruiter Screen",
  "Technical Interview",
  "Technical Assessment",
  "Hiring Manager Interview",
  "Final Interview",
  "Offer Discussion",
  "Other",
] as const;
export type InterviewStage = (typeof INTERVIEW_STAGES)[number];

export const INTERVIEW_TYPES = [
  "Phone",
  "Video",
  "Onsite",
  "Take-home",
  "Live Coding",
  "Other",
] as const;
export type InterviewType = (typeof INTERVIEW_TYPES)[number];

export const TIMELINE_EVENT_TYPES = [
  "Status Change",
  "Note",
  "Recruiter Update",
  "Interview Update",
  "Reminder Created",
  "General Update",
] as const;
export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];

export const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD", "NGN", "Other"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const STATUS_STYLES: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  Saved: {
    label: "Saved",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    dot: "bg-slate-400",
  },
  Applied: {
    label: "Applied",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  Screening: {
    label: "Screening",
    className:
      "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  Interview: {
    label: "Interview",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  "Technical Assessment": {
    label: "Assessment",
    className:
      "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  "Final Interview": {
    label: "Final Round",
    className:
      "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
    dot: "bg-teal-500",
  },
  Offer: {
    label: "Offer",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
    dot: "bg-green-500",
  },
  Rejected: {
    label: "Rejected",
    className:
      "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
    dot: "bg-red-500",
  },
  Withdrawn: {
    label: "Withdrawn",
    className:
      "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
    dot: "bg-gray-400",
  },
};

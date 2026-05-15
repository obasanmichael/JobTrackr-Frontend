import type { Interview } from "@/types";
import type { InterviewStage, InterviewType } from "@/lib/constants";

/** Shape returned by `InterviewResponseDto` over JSON. */
export interface InterviewApiRecord {
  id: string;
  userId: string;
  applicationId: string;
  stage: string;
  interviewType: string;
  scheduledAt: string;
  location?: string | null;
  meetingLink?: string | null;
  notes?: string | null;
  outcome?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STAGE_FROM_API: Record<string, InterviewStage> = {
  RECRUITER_SCREEN: "Recruiter Screen",
  TECHNICAL_INTERVIEW: "Technical Interview",
  TECHNICAL_ASSESSMENT: "Technical Assessment",
  HIRING_MANAGER: "Hiring Manager Interview",
  FINAL_INTERVIEW: "Final Interview",
  OFFER_DISCUSSION: "Offer Discussion",
  OTHER: "Other",
};

const STAGE_TO_API: Record<InterviewStage, string> = {
  "Recruiter Screen": "RECRUITER_SCREEN",
  "Technical Interview": "TECHNICAL_INTERVIEW",
  "Technical Assessment": "TECHNICAL_ASSESSMENT",
  "Hiring Manager Interview": "HIRING_MANAGER",
  "Final Interview": "FINAL_INTERVIEW",
  "Offer Discussion": "OFFER_DISCUSSION",
  Other: "OTHER",
};

const TYPE_FROM_API: Record<string, InterviewType> = {
  PHONE: "Phone",
  VIDEO: "Video",
  ONSITE: "Onsite",
  TAKE_HOME: "Take-home",
  LIVE_CODING: "Live Coding",
  OTHER: "Other",
};

const TYPE_TO_API: Record<InterviewType, string> = {
  Phone: "PHONE",
  Video: "VIDEO",
  Onsite: "ONSITE",
  "Take-home": "TAKE_HOME",
  "Live Coding": "LIVE_CODING",
  Other: "OTHER",
};

export function interviewFromApi(record: InterviewApiRecord): Interview {
  const toIso = (v: string) =>
    typeof v === "string" ? v : new Date(v as unknown as Date).toISOString();

  return {
    id: record.id,
    userId: record.userId,
    applicationId: record.applicationId,
    stage: STAGE_FROM_API[record.stage] ?? "Other",
    type: TYPE_FROM_API[record.interviewType] ?? "Other",
    scheduledAt: record.scheduledAt ? toIso(record.scheduledAt) : undefined,
    location: record.location ?? record.meetingLink ?? undefined,
    notes: record.notes ?? undefined,
    outcome: record.outcome ?? undefined,
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
  };
}

export interface CreateInterviewBody {
  applicationId: string;
  stage: string;
  interviewType: string;
  scheduledAt: string;
  location?: string;
  meetingLink?: string;
  notes?: string;
  outcome?: string;
}

export interface UpdateInterviewBody {
  stage?: string;
  interviewType?: string;
  scheduledAt?: string;
  location?: string;
  notes?: string;
  outcome?: string;
}

export function interviewCreatePayloadToApi(payload: {
  applicationId: string;
  stage: InterviewStage;
  type: InterviewType;
  scheduledAt: string;
  location?: string;
  notes?: string;
  outcome?: string;
}): CreateInterviewBody {
  return {
    applicationId: payload.applicationId,
    stage: STAGE_TO_API[payload.stage] ?? "OTHER",
    interviewType: TYPE_TO_API[payload.type] ?? "OTHER",
    scheduledAt: payload.scheduledAt,
    location: payload.location,
    notes: payload.notes,
    outcome: payload.outcome,
  };
}

export function interviewUpdatePayloadToApi(payload: {
  stage?: InterviewStage;
  type?: InterviewType;
  scheduledAt?: string;
  location?: string;
  notes?: string;
  outcome?: string;
}): UpdateInterviewBody {
  const body: UpdateInterviewBody = {};
  if (payload.stage !== undefined) body.stage = STAGE_TO_API[payload.stage] ?? "OTHER";
  if (payload.type !== undefined) body.interviewType = TYPE_TO_API[payload.type] ?? "OTHER";
  if (payload.scheduledAt !== undefined) body.scheduledAt = payload.scheduledAt;
  if (payload.location !== undefined) body.location = payload.location;
  if (payload.notes !== undefined) body.notes = payload.notes;
  if (payload.outcome !== undefined) body.outcome = payload.outcome;
  return body;
}

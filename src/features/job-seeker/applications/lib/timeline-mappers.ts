import type { TimelineEventType } from "@/lib/constants";
import type { CreateTimelineEventPayload, TimelineEvent } from "@/types";

/** JSON shape of `ApplicationEventResponseDto`. */
export interface ApplicationEventApiRecord {
  id: string;
  userId: string;
  applicationId: string;
  type: string;
  title: string;
  description?: string | null;
  createdAt: string;
}

const API_TO_UI_TYPE: Record<string, TimelineEventType> = {
  STATUS_CHANGE: "Status Change",
  NOTE: "Note",
  RECRUITER_UPDATE: "Recruiter Update",
  INTERVIEW_UPDATE: "Interview Update",
  REMINDER_CREATED: "Reminder Created",
  GENERAL_UPDATE: "General Update",
};

const UI_TO_API_TYPE: Record<TimelineEventType, string> = {
  "Status Change": "STATUS_CHANGE",
  Note: "NOTE",
  "Recruiter Update": "RECRUITER_UPDATE",
  "Interview Update": "INTERVIEW_UPDATE",
  "Reminder Created": "REMINDER_CREATED",
  "General Update": "GENERAL_UPDATE",
};

export function eventFromApi(dto: ApplicationEventApiRecord): TimelineEvent {
  const desc = dto.description?.trim();
  const content = desc ? `${dto.title}\n\n${desc}` : dto.title;
  const createdAt =
    typeof dto.createdAt === "string"
      ? dto.createdAt
      : new Date(dto.createdAt as unknown as Date).toISOString();

  return {
    id: dto.id,
    applicationId: dto.applicationId,
    type: API_TO_UI_TYPE[dto.type] ?? "General Update",
    content,
    createdAt,
  };
}

export function createTimelinePayloadToApi(
  payload: CreateTimelineEventPayload
): Pick<ApplicationEventApiRecord, "type" | "title"> & {
  description?: string;
} {
  const type = UI_TO_API_TYPE[payload.type];
  const text = payload.content.trim();
  const title = text.slice(0, 120);
  const rest = text.slice(120);
  const description = rest.length > 0 ? rest.slice(0, 2000) : undefined;
  return { type, title, description };
}

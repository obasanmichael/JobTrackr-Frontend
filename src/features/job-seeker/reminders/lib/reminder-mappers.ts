import type { Reminder } from "@/types";

/** Shape returned by `ReminderResponseDto` over JSON. */
export interface ReminderApiRecord {
  id: string;
  userId: string;
  applicationId: string;
  title: string;
  description?: string | null;
  dueDate: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export function reminderFromApi(record: ReminderApiRecord): Reminder {
  return {
    id: record.id,
    userId: record.userId,
    applicationId: record.applicationId,
    title: record.title,
    description: record.description ?? undefined,
    dueDate:
      typeof record.dueDate === "string"
        ? record.dueDate
        : new Date(record.dueDate as unknown as Date).toISOString(),
    completed: record.isCompleted,
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

export interface CreateReminderBody {
  applicationId: string;
  title: string;
  description?: string;
  dueDate: string;
}

export interface UpdateReminderBody {
  title?: string;
  description?: string;
  dueDate?: string;
  isCompleted?: boolean;
}

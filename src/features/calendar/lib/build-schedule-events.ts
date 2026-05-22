import { addMinutes } from "date-fns";
import type { Application, Interview, Reminder } from "@/types";
import type { ScheduleEvent } from "./schedule-event.types";

const INTERVIEW_DURATION_MINUTES = 60;
const REMINDER_DURATION_MINUTES = 30;

function applicationLabel(
  applicationId: string,
  applicationsById: Map<string, Application>,
): { company: string; jobTitle: string } | null {
  const app = applicationsById.get(applicationId);
  if (!app) {
    return null;
  }
  return { company: app.company, jobTitle: app.jobTitle };
}

export function buildScheduleEvents(input: {
  interviews: Interview[];
  reminders: Reminder[];
  applications: Application[];
  includeCompletedReminders?: boolean;
}): ScheduleEvent[] {
  const applicationsById = new Map(
    input.applications.map((app) => [app.id, app]),
  );
  const events: ScheduleEvent[] = [];

  for (const interview of input.interviews) {
    if (!interview.scheduledAt) {
      continue;
    }
    const start = new Date(interview.scheduledAt);
    if (Number.isNaN(start.getTime())) {
      continue;
    }

    const appInfo =
      interview.application ??
      applicationLabel(interview.applicationId, applicationsById);
    const company = appInfo?.company ?? "Interview";
    const jobTitle = appInfo?.jobTitle;

    events.push({
      id: `interview-${interview.id}`,
      kind: "interview",
      title: `${company} — ${interview.stage}`,
      subtitle: jobTitle ? `${jobTitle} · ${interview.type}` : interview.type,
      start,
      end: addMinutes(start, INTERVIEW_DURATION_MINUTES),
      applicationId: interview.applicationId,
      href: `/dashboard/applications/${interview.applicationId}`,
    });
  }

  for (const reminder of input.reminders) {
    if (reminder.completed && !input.includeCompletedReminders) {
      continue;
    }
    const start = new Date(reminder.dueDate);
    if (Number.isNaN(start.getTime())) {
      continue;
    }

    const appInfo = applicationLabel(reminder.applicationId ?? "", applicationsById);

    events.push({
      id: `reminder-${reminder.id}`,
      kind: "reminder",
      title: reminder.title,
      subtitle: appInfo ? `${appInfo.company} · ${appInfo.jobTitle}` : undefined,
      start,
      end: addMinutes(start, REMINDER_DURATION_MINUTES),
      applicationId: reminder.applicationId ?? "",
      href: reminder.applicationId
        ? `/dashboard/applications/${reminder.applicationId}`
        : "/dashboard/reminders",
      completed: reminder.completed,
    });
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

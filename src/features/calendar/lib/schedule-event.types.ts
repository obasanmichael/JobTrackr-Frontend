export type ScheduleEventKind = "interview" | "reminder";

export interface ScheduleEvent {
  id: string;
  kind: ScheduleEventKind;
  title: string;
  subtitle?: string;
  start: Date;
  end: Date;
  applicationId: string;
  href: string;
  completed?: boolean;
}

export type ScheduleViewMode = "month" | "week";

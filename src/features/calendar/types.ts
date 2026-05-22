export type CalendarProvider = "GOOGLE";

export type CalendarEventSyncStatus = "SYNCED" | "PENDING" | "FAILED";

export interface CalendarStatusApi {
  provider: CalendarProvider | null;
  connected: boolean;
  providerAccountEmail?: string | null;
  lastSyncAt?: string | null;
  lastError?: string | null;
  autoSyncInterviews: boolean;
}

export interface CalendarConnectApi {
  authorizationUrl: string;
}

export interface PatchCalendarSettingsInput {
  autoSyncInterviews?: boolean;
}

export interface SyncInterviewsInput {
  interviewId?: string;
}

export interface CalendarSyncResultItemApi {
  interviewId: string;
  syncStatus: CalendarEventSyncStatus;
  providerEventId?: string | null;
  error?: string | null;
}

export interface SyncInterviewsApi {
  results: CalendarSyncResultItemApi[];
  syncedCount: number;
  failedCount: number;
}

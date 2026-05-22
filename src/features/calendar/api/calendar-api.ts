import { api } from "@/shared/lib/http-client";
import type {
  CalendarConnectApi,
  CalendarStatusApi,
  PatchCalendarSettingsInput,
  SyncInterviewsApi,
  SyncInterviewsInput,
} from "../types";

export async function fetchCalendarStatus(): Promise<CalendarStatusApi> {
  const { data } = await api.get<CalendarStatusApi>("/calendar/status");
  return data;
}

export async function fetchCalendarConnectUrl(): Promise<CalendarConnectApi> {
  const { data } = await api.get<CalendarConnectApi>("/calendar/google/connect");
  return data;
}

export async function disconnectCalendar(): Promise<CalendarStatusApi> {
  const { data } = await api.post<CalendarStatusApi>("/calendar/disconnect");
  return data;
}

export async function patchCalendarSettings(
  input: PatchCalendarSettingsInput,
): Promise<CalendarStatusApi> {
  const { data } = await api.patch<CalendarStatusApi>("/calendar/settings", input);
  return data;
}

export async function syncCalendarInterviews(
  input: SyncInterviewsInput = {},
): Promise<SyncInterviewsApi> {
  const { data } = await api.post<SyncInterviewsApi>(
    "/calendar/sync/interviews",
    input,
  );
  return data;
}

import { api } from "@/shared/lib/http-client";
import type { ApplicationEventApiRecord } from "../lib/timeline-mappers";

export async function listApplicationEvents(
  applicationId: string
): Promise<ApplicationEventApiRecord[]> {
  const { data } = await api.get<ApplicationEventApiRecord[]>(
    `/applications/${applicationId}/events`
  );
  return data;
}

export async function createApplicationEvent(
  applicationId: string,
  body: { type: string; title: string; description?: string }
): Promise<ApplicationEventApiRecord> {
  const { data } = await api.post<ApplicationEventApiRecord>(
    `/applications/${applicationId}/events`,
    body
  );
  return data;
}

export async function deleteApplicationEvent(eventId: string): Promise<void> {
  await api.delete(`/application-events/${eventId}`);
}

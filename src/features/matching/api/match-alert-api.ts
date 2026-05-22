import { api } from "@/shared/lib/http-client";

export type MatchAlertPreference = {
  enabled: boolean;
  minMatchScore: number;
  channels: Record<string, boolean> | null;
  lastNotifiedAt: string | null;
  updatedAt?: string;
};

export type UpdateMatchAlertPreferencePayload = {
  enabled?: boolean;
  minMatchScore?: number;
  channels?: Record<string, boolean>;
};

export async function getMatchAlertPreferencesRequest(): Promise<MatchAlertPreference> {
  const { data } = await api.get<MatchAlertPreference>(
    "/matches/alert-preferences",
  );
  return data;
}

export async function updateMatchAlertPreferencesRequest(
  payload: UpdateMatchAlertPreferencePayload,
): Promise<MatchAlertPreference> {
  const { data } = await api.patch<MatchAlertPreference>(
    "/matches/alert-preferences",
    payload,
  );
  return data;
}

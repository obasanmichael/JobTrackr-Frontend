import { api } from "@/shared/lib/http-client";

export type NotificationChannels = {
  email: boolean;
  push: boolean;
  inApp: boolean;
};

export type MatchCategoryPreference = {
  enabled: boolean;
  minMatchScore: number;
  channels: NotificationChannels;
};

export type TimedCategoryPreference = {
  enabled: boolean;
  channels: NotificationChannels;
  leadMinutes: number[];
};

export type NotificationCategories = {
  matches: MatchCategoryPreference;
  reminders: TimedCategoryPreference;
  interviews: TimedCategoryPreference;
};

export type NotificationPreference = {
  categories: NotificationCategories;
  updatedAt?: string;
};

export type UpdateNotificationPreferencePayload = {
  categories?: Partial<{
    matches: Partial<MatchCategoryPreference> & {
      channels?: Partial<NotificationChannels>;
    };
    reminders: Partial<TimedCategoryPreference> & {
      channels?: Partial<NotificationChannels>;
    };
    interviews: Partial<TimedCategoryPreference> & {
      channels?: Partial<NotificationChannels>;
    };
  }>;
};

export async function getNotificationPreferencesRequest(): Promise<NotificationPreference> {
  const { data } = await api.get<NotificationPreference>(
    "/notifications/preferences",
  );
  return data;
}

export async function updateNotificationPreferencesRequest(
  payload: UpdateNotificationPreferencePayload,
): Promise<NotificationPreference> {
  const { data } = await api.patch<NotificationPreference>(
    "/notifications/preferences",
    payload,
  );
  return data;
}

import { api } from "@/shared/lib/http-client";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListResult = {
  items: NotificationItem[];
  unreadCount: number;
};

function normalizeNotification(raw: NotificationItem): NotificationItem {
  return {
    ...raw,
    readAt: raw.readAt ?? null,
    metadata: raw.metadata ?? null,
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : String(raw.createdAt),
  };
}

export async function listNotificationsRequest(params?: {
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationListResult> {
  const { data } = await api.get<NotificationListResult>("/notifications", {
    params,
  });
  return {
    unreadCount: data.unreadCount,
    items: data.items.map(normalizeNotification),
  };
}

export async function getUnreadNotificationCountRequest(): Promise<number> {
  const { data } = await api.get<{ unreadCount: number }>(
    "/notifications/unread-count",
  );
  return data.unreadCount;
}

export async function markNotificationReadRequest(
  notificationId: string,
): Promise<NotificationItem> {
  const { data } = await api.patch<NotificationItem>(
    `/notifications/${notificationId}/read`,
  );
  return normalizeNotification(data);
}

export async function markAllNotificationsReadRequest(): Promise<number> {
  const { data } = await api.post<{ updatedCount: number }>(
    "/notifications/read-all",
  );
  return data.updatedCount;
}

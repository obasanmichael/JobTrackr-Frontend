"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  listNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
  type NotificationItem,
} from "@/features/notifications/api/notifications-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatWhen(value: string): string {
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
}

function NotificationRow({
  item,
  onMarkRead,
  marking,
}: {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
  marking: boolean;
}) {
  const unread = !item.readAt;

  return (
    <Card
      className={cn(
        "transition-colors",
        unread ? "border-primary/30 bg-primary/5" : "opacity-90",
      )}
    >
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {unread ? (
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
            ) : null}
            <p className="text-sm font-medium text-foreground">{item.title}</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatWhen(item.createdAt)}
          </p>
        </div>
        {unread ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={marking}
            onClick={() => onMarkRead(item.id)}
          >
            Mark read
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => listNotificationsRequest({ limit: 50 }),
    refetchInterval: 60_000,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationReadRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsReadRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Reminders, interviews, and other alerts from JobTrackr.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={unreadCount === 0 || markAllMutation.isPending}
          onClick={() => void markAllMutation.mutate()}
        >
          {markAllMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="h-4 w-4" />
          )}
          Mark all read
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading notifications…
        </div>
      ) : error ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
          <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No notifications yet. When reminders or interviews are due, they will
              show up here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {isFetching && !isLoading ? (
            <p className="text-xs text-muted-foreground">Refreshing…</p>
          ) : null}
          {items.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              marking={markReadMutation.isPending}
              onMarkRead={(id) => markReadMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

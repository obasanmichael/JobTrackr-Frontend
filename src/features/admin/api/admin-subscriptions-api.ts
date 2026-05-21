import type {
  AdminSubscriptionsPageApi,
  AdminSubscriptionRowApi,
} from "@/features/admin/types";
import { api } from "@/shared/lib/http-client";

export async function listAdminSubscriptions(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<AdminSubscriptionsPageApi> {
  const { data } = await api.get<AdminSubscriptionsPageApi>(
    "/admin/subscriptions",
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        search: params.search?.trim() || undefined,
      },
    },
  );
  return data;
}

export async function patchAdminSubscription(
  userId: string,
  body: { planCode?: string; status?: string },
): Promise<AdminSubscriptionRowApi> {
  const { data } = await api.patch<AdminSubscriptionRowApi>(
    `/admin/subscriptions/${userId}`,
    body,
  );
  return data;
}
